const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, phone, college, profilePicture } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if roll number already exists
    if (rollNumber) {
      const existingRollNumber = await prisma.user.findFirst({ where: { rollNumber } });
      if (existingRollNumber) {
        return res.status(400).json({ error: 'User already exists with this roll number' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-generate profile picture URL from roll number if provided
    let finalProfilePicture = profilePicture;
    if (rollNumber && !profilePicture) {
      const formattedRollNumber = rollNumber.toUpperCase().trim();
      finalProfilePicture = `https://erp.lbrce.ac.in/Admissions/Stu_Photo_Sign/P-${formattedRollNumber}.jpg`;
      console.log('Generated profile picture URL:', finalProfilePicture);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'buyer',
        rollNumber: rollNumber || null,
        phone: phone || null,
        college: college || null,
        profilePicture: finalProfilePicture || null
      }
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        phone: user.phone,
        college: user.college,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        rollNumber: true,
        phone: true,
        college: true,
        profilePicture: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getMe };
