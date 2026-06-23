const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

function generateAnonymousCode() {
  const adjectives = ['安静的', '温暖的', '孤独的', '明亮的', '温柔的', '真诚的', '勇敢的', '细腻的'];
  const nouns = ['星星', '月亮', '云朵', '微风', '落叶', '晨光', '晚霞', '细雨'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `${adj}${noun}${num}`;
}

const SENSITIVE_WORDS = ['自杀', '自残', '无助', '绝望'];

function containsSensitiveWords(text) {
  return SENSITIVE_WORDS.some(word => text.includes(word));
}

module.exports = { generateToken, generateAnonymousCode, containsSensitiveWords };