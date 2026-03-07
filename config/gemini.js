const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMoodTrend(moodData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a mental health assistant. Analyze this mood data and provide insights:
    ${JSON.stringify(moodData)}
    
    Provide:
    1. Overall mood trend summary
    2. Patterns or concerns identified
    3. Personalized recommendations
    4. Whether professional help is recommended (YES/NO with reasoning)
    
    Keep the response concise and empathetic.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message || error);
    return 'Unable to analyze mood data at this time — the AI service quota has been reached. Please try again later or check your Gemini API billing settings.';
  }
}

async function generateTherapyContent(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `As a mental health professional, create a brief, helpful article about: ${topic}
    
    Include:
    1. Introduction
    2. Key techniques or exercises (3-5)
    3. Tips for daily practice
    4. When to seek professional help
    
    Keep it under 500 words, warm, and actionable.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return null;
  }
}

async function analyzeQuestionnaire(answers) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are a compassionate mental health professional. A user completed a mental wellness onboarding questionnaire. Analyze their answers and provide a personalized assessment.

Answers: ${JSON.stringify(answers)}

Provide a response in this exact JSON format (no markdown, just raw JSON):
{
  "overallScore": <number 1-100>,
  "category": "<Thriving|Doing Well|Needs Attention|At Risk>",
  "summary": "<2-3 sentence empathetic summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areasToImprove": ["<area 1>", "<area 2>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"],
  "suggestedActivities": ["<activity from: journaling, art therapy, music therapy, meditation, exercise>"],
  "seekProfessionalHelp": <true or false>,
  "professionalHelpReason": "<reason if true, empty string if false>"
}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Questionnaire Analysis Error:', error.message || error);
    // Return a smart fallback based on the answers themselves
    return generateFallbackAnalysis(answers);
  }
}

function generateFallbackAnalysis(answers) {
  // Score based on answer patterns (higher = healthier responses)
  const positiveAnswers = ['support','creative','constantly','often','learning','kindness','very_important','important',
    'consistency','reduce_stress','connection','music','art','journaling','comfortable','very_comfortable',
    'most_mornings','almost_every_day','every_day','once_or_twice_week','most_of_the_time','almost_all','very_important','important','5','4','good','excellent'];
  const negativeAnswers = ['isolation','rarely','critical','not_important','never','time','luxury','very_low','very_uncomfortable','rarely_never','almost_never','never','not_important','1','2'];

  let positiveCount = 0, negativeCount = 0, total = 0;
  Object.values(answers).forEach(v => {
    total++;
    if (positiveAnswers.includes(v)) positiveCount++;
    if (negativeAnswers.includes(v)) negativeCount++;
  });

  const ratio = total > 0 ? positiveCount / total : 0.5;
  const score = Math.round(30 + ratio * 60);
  const category = score >= 75 ? 'Doing Well' : score >= 50 ? 'Needs Attention' : 'At Risk';

  const strengths = [];
  const improvements = [];
  const recommendations = [];

  if (answers.q1 === 'support' || answers.q1 === 'creative') strengths.push('You have healthy coping mechanisms when feeling overwhelmed');
  if (answers.q2 === 'often' || answers.q2 === 'constantly') strengths.push('Strong emotional awareness and self-reflection');
  if (answers.q3 === 'learning' || answers.q3 === 'kindness') strengths.push('Self-compassionate approach to mistakes');
  if (answers.q9 === 'good' || answers.q9 === 'excellent') strengths.push('Strong social support network');
  if (answers.q12 === 'most_mornings' || answers.q12 === 'almost_every_day') strengths.push('Good sleep quality contributing to mental wellness');

  if (answers.q1 === 'isolation') improvements.push('Tendency to withdraw when overwhelmed — building connection skills can help');
  if (answers.q2 === 'rarely') improvements.push('Limited emotional processing — regular check-ins with yourself would be beneficial');
  if (answers.q3 === 'critical') improvements.push('Self-criticism after mistakes — practicing self-compassion is important');
  if (answers.q5 === 'never' || answers.q5 === 'rarely') improvements.push('Limited creative outlets — expressive activities can be powerful stress relievers');
  if (answers.q8 === 'time') improvements.push('Feeling too busy for self-care — even 5 minutes daily makes a difference');
  if (answers.q12 === 'rarely_never') improvements.push('Poor sleep quality — sleep hygiene practices could help significantly');

  recommendations.push('Try journaling for 10 minutes before bed to process your day');
  recommendations.push('Explore the Art Therapy and Music sections in the app for creative stress relief');
  if (score < 50) recommendations.push('Consider speaking with one of our psychologists for personalized guidance');
  else recommendations.push('Set small, achievable daily wellness goals to build momentum');
  recommendations.push('Track your moods daily using the dashboard to identify patterns and triggers');

  if (strengths.length === 0) strengths.push('Willingness to take this assessment shows self-awareness');
  if (improvements.length === 0) improvements.push('Continue building on your existing positive habits');

  return JSON.stringify({
    overallScore: score,
    category,
    summary: `Based on your responses, your mental wellness score is ${score}/100. ${category === 'Doing Well' ? 'You show many positive habits and coping strategies.' : category === 'Needs Attention' ? 'There are areas where focused attention could meaningfully improve your wellbeing.' : 'Some of your responses suggest you may benefit from additional support and resources.'}`,
    strengths: strengths.slice(0, 3),
    areasToImprove: improvements.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    suggestedActivities: ['journaling', 'art therapy', 'music therapy'],
    seekProfessionalHelp: score < 40,
    professionalHelpReason: score < 40 ? 'Your responses suggest you could benefit from speaking with a mental health professional for personalized support.' : ''
  });
}

module.exports = {
  analyzeMoodTrend,
  generateTherapyContent,
  analyzeQuestionnaire
};
