export const vulgarWords = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", "whore", "slut", 
  "faggot", "nigger", "bastard", "motherfucker", "cock", "porn", "xxx", "sex", "rape",
  "kutta", "gandu", "kamina", "chutiya", "madarchod", "bhenchod", "bhosdike", "randi",
  "harami", "lun", "loda", "chut"
];

export const hasVulgarity = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return vulgarWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
};
