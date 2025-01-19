import { prisma } from '@/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, verificationCode } = req.body;

  try {
    // Find the temporary user
    const tempUser = await prisma.tempUser.findUnique({
      where: { email }
    });

    // Check if temp user exists
    if (!tempUser) {
      return res.status(404).json({ message: 'Registration not found or expired' });
    }

    // Check if verification code has expired
    if (new Date() > new Date(tempUser.expiresAt)) {
      await prisma.tempUser.delete({
        where: { email }
      });
      return res.status(410).json({ message: 'Verification code has expired. Please register again.' });
    }

    // Verify the code
    if (tempUser.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Create the verified user
    const user = await prisma.user.create({
      data: {
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
      }
    });

    // Delete the temporary user
    await prisma.tempUser.delete({
      where: { email }
    });

    return res.status(200).json({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error during verification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}