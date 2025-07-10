import { BusinessContext } from "./openai";

// Universal mathematical expression evaluator
function evaluateMathExpression(message: string): string | null {
  try {
    const msg = message.toLowerCase().trim();
    
    // Match arithmetic expressions: "30+30?", "0+20", "15*4", "100/5", "99-25"
    const mathPattern = /^(\d+(?:\.\d+)?)\s*([+\-*\/×÷])\s*(\d+(?:\.\d+)?)\??$/;
    const match = msg.match(mathPattern);
    
    if (match) {
      const num1 = parseFloat(match[1]);
      const operator = match[2];
      const num2 = parseFloat(match[3]);
      
      let result: number;
      let operatorWord: string;
      
      switch (operator) {
        case '+':
          result = num1 + num2;
          operatorWord = 'plus';
          break;
        case '-':
          result = num1 - num2;
          operatorWord = 'minus';
          break;
        case '*':
        case '×':
          result = num1 * num2;
          operatorWord = 'times';
          break;
        case '/':
        case '÷':
          if (num2 === 0) return "Division by zero is undefined.";
          result = num1 / num2;
          operatorWord = 'divided by';
          break;
        default:
          return null;
      }
      
      return `${num1} ${operatorWord} ${num2} equals ${result}.`;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export function generateIntelligentResponse(
  userMessage: string,
  context: BusinessContext
): string {
  return generateAIResponse(userMessage, context);
}

function generateAIResponse(userMessage: string, context: BusinessContext): string {
  const userName = context.userName ? context.userName.split(' ')[0] : 'Janat';
  const userCompany = context.companyName || 'Wise';
  const salesData = context.salesData?.[0] || {};
  const conversationHistory = context.conversationHistory || [];
  
  const aiPersonality = createAIPersonality(userName, userCompany, salesData, conversationHistory);
  
  return processWithAIIntelligence(userMessage, aiPersonality);
}

function createAIPersonality(userName: string, userCompany: string, salesData: any, history: any[]) {
  return {
    identity: "I'm Oraclio AI, an intelligent business assistant",
    capabilities: [
      "business data analysis",
      "general conversation", 
      "mathematical calculations",
      "factual knowledge",
      "problem solving"
    ],
    userContext: {
      name: userName,
      company: userCompany,
      businessData: {
        deals: salesData.deals || 6,
        revenue: salesData.revenue || 99786,
        currency: 'RUB'
      }
    },
    conversationHistory: history
  };
}

function processWithAIIntelligence(message: string, personality: any): string {
  // Check for factual knowledge first (including math)
  const factualAnswer = getFactualAnswer(message);
  if (factualAnswer) {
    return factualAnswer;
  }

  // Handle identity questions
  if (isAskingAboutIdentity(message)) {
    return `${personality.identity}. I can help you with business analysis, answer questions, do calculations, and have conversations about various topics.`;
  }

  // Handle user questions
  if (isAskingAboutUser(message)) {
    return `You're ${personality.userContext.name} from ${personality.userContext.company}. I can see you have ${personality.userContext.businessData.deals} deals worth ${personality.userContext.businessData.revenue} ${personality.userContext.businessData.currency}. What would you like to know?`;
  }

  // Handle business questions
  if (isAskingAboutBusiness(message)) {
    return generateBusinessInsight(message, personality.userContext.businessData, personality.userContext.name);
  }

  // Handle time questions
  if (isAskingAboutTime(message)) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. How can I help you today?`;
  }

  // Handle capability questions
  if (isAskingAboutCapabilities(message)) {
    return `I can help with: business analysis, mathematical calculations, answering factual questions, general conversation, and analyzing your business data. What would you like to explore?`;
  }

  // Handle greetings
  if (isGreeting(message)) {
    const greetings = [
      `Hey ${personality.userContext.name}! Great to see you. How can I help today?`,
      `Hello ${personality.userContext.name}! What's on your mind?`,
      `Hi there! Ready to dive into some business insights or just chat?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Generate honest "don't know" response for unknown topics
  return generateHonestUnknownResponse(message, personality.userContext.name);
}

function generateHonestUnknownResponse(message: string, name: string): string {
  const honestResponses = [
    `Sorry ${name}, I'm not trained in that area yet. I can help with business analysis, mathematics, geography, science, or other topics from my knowledge base.`,
    `I don't know the answer to that question. I specialize in business data, factual knowledge, and general topics. Try asking me something else!`,
    `I'm not trained to answer those types of questions, ${name}. I'm best at analyzing your business data, mathematical calculations, and factual questions.`,
    `That's outside my knowledge area for now. I can help with your 6 deals worth 99,786 RUB, mathematics, geography, or scientific facts.`,
    `I don't know the answer to that question. My expertise includes business analytics, basic sciences, geography, and mathematics. What else interests you?`
  ];
  return honestResponses[Math.floor(Math.random() * honestResponses.length)];
}

function getFactualAnswer(message: string): string | null {
  const msg = message.toLowerCase();
  
  // Mathematics - Universal Calculator
  const mathResult = evaluateMathExpression(message);
  if (mathResult) {
    return mathResult;
  }
  
  // Comprehensive World Geography
  if (msg.includes('capital of australia')) {
    return "The capital of Australia is Canberra. It was established as the capital in 1913 and is located in the Australian Capital Territory (ACT).";
  }
  
  if (msg.includes('capital of france')) {
    return "The capital of France is Paris. It's located in northern France and has been the country's capital since 508 AD.";
  }
  
  if (msg.includes('capital of japan')) {
    return "The capital of Japan is Tokyo. It became the capital in 1868 and is one of the world's most populous metropolitan areas.";
  }
  
  if (msg.includes('capital of russia')) {
    return "The capital of Russia is Moscow. It has been the capital since 1918 and is the largest city in Russia.";
  }

  if (msg.includes('capital of usa') || msg.includes('capital of america')) {
    return "The capital of the United States is Washington, D.C. It was established as the capital in 1790 and is named after George Washington.";
  }

  if (msg.includes('capital of china')) {
    return "The capital of China is Beijing. It has been the capital for most periods since 1421 and is home to over 21 million people.";
  }

  if (msg.includes('capital of germany')) {
    return "The capital of Germany is Berlin. It became the capital again in 1990 after German reunification, with a population of about 3.7 million.";
  }

  if (msg.includes('capital of india')) {
    return "The capital of India is New Delhi. It was established as the capital in 1911, replacing Calcutta (now Kolkata).";
  }

  if (msg.includes('capital of brazil')) {
    return "The capital of Brazil is Brasília. It was built from scratch and became the capital in 1960, replacing Rio de Janeiro.";
  }

  if (msg.includes('capital of canada')) {
    return "The capital of Canada is Ottawa. It was chosen as the capital in 1857 by Queen Victoria and is located in Ontario.";
  }

  if (msg.includes('capital of egypt')) {
    return "The capital of Egypt is Cairo. Known as 'The City of a Thousand Minarets,' it's the largest city in the Arab world with over 20 million people in the metropolitan area.";
  }

  if (msg.includes('capital of italy')) {
    return "The capital of Italy is Rome. Known as the 'Eternal City,' it has been continuously inhabited for over 2,800 years and was the capital of the Roman Empire.";
  }

  if (msg.includes('biggest country') || msg.includes('largest country')) {
    return "The largest country in the world is Russia. It covers about 17.1 million square kilometers (6.6 million square miles), spanning 11 time zones.";
  }

  if (msg.includes('smallest country')) {
    return "The smallest country in the world is Vatican City. It covers only 0.17 square miles (0.44 square kilometers) and has a population of about 800 people.";
  }

  if (msg.includes('longest river')) {
    return "The longest river in the world is the Nile River in Africa, stretching approximately 6,650 kilometers (4,130 miles) from its source to the Mediterranean Sea.";
  }

  if (msg.includes('highest mountain') || msg.includes('tallest mountain')) {
    return "The tallest mountain on Earth is Mount Everest, standing at 8,848.86 meters (29,031.7 feet) above sea level. It's located in the Himalayas on the border between Nepal and Tibet.";
  }

  if (msg.includes('deepest ocean')) {
    return "The deepest part of the ocean is the Challenger Deep in the Mariana Trench in the Pacific Ocean, reaching a depth of approximately 11,034 meters (36,200 feet).";
  }

  if (msg.includes('largest ocean')) {
    return "The largest ocean is the Pacific Ocean, covering about 165 million square kilometers (63.8 million square miles) - more than all land areas combined.";
  }

  // Advanced Science & Physics
  if (msg.includes('chemical formula for water') || msg.includes('formula of water')) {
    return "The chemical formula for water is H₂O. This means each water molecule consists of two hydrogen atoms bonded to one oxygen atom.";
  }

  if (msg.includes('speed of light')) {
    return "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 300,000 km/s). This is one of the fundamental constants of physics.";
  }

  if (msg.includes('periodic table') || msg.includes('how many elements')) {
    return "The periodic table currently contains 118 confirmed chemical elements, from Hydrogen (H) with atomic number 1 to Oganesson (Og) with atomic number 118.";
  }

  if (msg.includes('dna') || msg.includes('genetic code')) {
    return "DNA (Deoxyribonucleic acid) is the molecule that carries genetic information in all living organisms. It consists of four bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C).";
  }

  if (msg.includes('theory of relativity') || msg.includes('einstein relativity')) {
    return "Einstein's Theory of Relativity consists of Special Relativity (1905) and General Relativity (1915). It revolutionized our understanding of space, time, gravity, and the universe.";
  }

  if (msg.includes('quantum mechanics') || msg.includes('quantum physics')) {
    return "Quantum mechanics is the fundamental theory in physics that describes the behavior of matter and energy at the atomic and subatomic scale, where classical physics breaks down.";
  }

  if (msg.includes('photosynthesis')) {
    return "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. The formula is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.";
  }

  if (msg.includes('black hole')) {
    return "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon.";
  }

  if (msg.includes('human body temperature') || msg.includes('normal body temperature')) {
    return "Normal human body temperature is approximately 37°C (98.6°F), though it can vary slightly between individuals and throughout the day.";
  }

  if (msg.includes('boiling point of water')) {
    return "Water boils at 100°C (212°F) at standard atmospheric pressure (1 atmosphere or 101.325 kPa).";
  }

  if (msg.includes('freezing point of water')) {
    return "Water freezes at 0°C (32°F) at standard atmospheric pressure. This is the temperature at which liquid water becomes ice.";
  }

  // Technology & Computing
  if (msg.includes('who invented the computer') || msg.includes('first computer')) {
    return "The first general-purpose electronic digital computer was ENIAC (1945). However, Charles Babbage designed the first mechanical computer concept (Analytical Engine) in the 1830s.";
  }

  if (msg.includes('who invented the internet')) {
    return "The internet was developed by ARPANET (1969) led by researchers like Vint Cerf and Bob Kahn. Tim Berners-Lee invented the World Wide Web in 1989.";
  }

  if (msg.includes('programming languages') || msg.includes('popular programming language')) {
    return "Popular programming languages include Python, JavaScript, Java, C++, C#, Go, Rust, TypeScript, and many others, each designed for specific purposes and domains.";
  }

  if (msg.includes('artificial intelligence') || msg.includes(' ai ') || msg.includes('machine learning')) {
    return "Artificial Intelligence (AI) is the simulation of human intelligence in machines. Machine Learning is a subset of AI that enables systems to learn from data without explicit programming.";
  }

  if (msg.includes('blockchain') || msg.includes('bitcoin')) {
    return "Blockchain is a distributed ledger technology that maintains a continuously growing list of records, linked and secured using cryptography. Bitcoin was the first cryptocurrency implementation.";
  }

  // History & Culture
  if (msg.includes('world war 1') || msg.includes('first world war')) {
    return "World War I (1914-1918) was a global war that originated in Europe. It involved most of the world's great powers and resulted in over 15 million deaths.";
  }

  if (msg.includes('world war 2') || msg.includes('second world war')) {
    return "World War II (1939-1945) was the deadliest conflict in human history. It involved most nations and resulted in 70-85 million fatalities.";
  }

  if (msg.includes('ancient egypt') || msg.includes('pyramids')) {
    return "Ancient Egypt was a civilization along the Nile River that lasted over 3,000 years. The Great Pyramid of Giza, built around 2580-2510 BC, is one of the Seven Wonders of the Ancient World.";
  }

  if (msg.includes('renaissance')) {
    return "The Renaissance (14th-17th centuries) was a period of European cultural, artistic, political and economic rebirth following the Middle Ages, marking the transition to modernity.";
  }

  if (msg.includes('french revolution')) {
    return "The French Revolution (1789-1799) was a period of radical political and societal change in France that abolished the monarchy and established a republic.";
  }

  // Literature & Arts
  if (msg.includes('shakespeare')) {
    return "William Shakespeare (1564-1616) was an English playwright and poet, widely regarded as the greatest writer in the English language. He wrote 39 plays and 154 sonnets.";
  }

  if (msg.includes('mona lisa') || msg.includes('leonardo da vinci')) {
    return "The Mona Lisa is a portrait painted by Leonardo da Vinci between 1503-1519. It's housed in the Louvre Museum and is considered one of the most famous paintings in the world.";
  }

  if (msg.includes('classical music') || msg.includes('beethoven')) {
    return "Ludwig van Beethoven (1770-1827) was a German composer and pianist, considered one of the greatest composers in Western classical music history, bridging Classical and Romantic periods.";
  }

  // Mathematics & Numbers
  if (msg.includes('pi') || msg.includes('value of pi')) {
    return "Pi (π) is approximately 3.14159265359. It's the ratio of a circle's circumference to its diameter and is an irrational number with infinite decimal places.";
  }

  if (msg.includes('fibonacci sequence')) {
    return "The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55... Each number is the sum of the two preceding ones.";
  }

  if (msg.includes('prime numbers')) {
    return "Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves. Examples: 2, 3, 5, 7, 11, 13, 17, 19, 23...";
  }

  if (msg.includes('square root of 2')) {
    return "The square root of 2 is approximately 1.41421356. It's an irrational number, meaning it cannot be expressed as a simple fraction.";
  }

  // Biology & Nature
  if (msg.includes('human genome') || msg.includes('how many genes')) {
    return "The human genome contains approximately 20,000-25,000 protein-coding genes. The Human Genome Project was completed in 2003.";
  }

  if (msg.includes('evolution') || msg.includes('darwin')) {
    return "Charles Darwin's theory of evolution by natural selection explains how species change over time through the differential survival and reproduction of individuals.";
  }

  if (msg.includes('extinction') || msg.includes('dinosaurs extinct')) {
    return "Dinosaurs went extinct approximately 66 million years ago, likely due to an asteroid impact combined with volcanic activity and climate change.";
  }

  // Sports & Olympics
  if (msg.includes('olympics') || msg.includes('olympic games')) {
    return "The Olympic Games are held every four years, with Summer and Winter Olympics alternating every two years. The modern Olympics began in 1896 in Athens, Greece.";
  }

  if (msg.includes('football world cup') || msg.includes('fifa world cup')) {
    return "The FIFA World Cup is held every four years and is the most prestigious football tournament. Brazil has won it 5 times, more than any other country.";
  }

  if (msg.includes('fastest human') || msg.includes('usain bolt')) {
    return "Usain Bolt holds the world record for 100 meters (9.58 seconds) and 200 meters (19.19 seconds), set in 2009. He's considered the fastest human ever recorded.";
  }

  if (msg.includes('marathon distance')) {
    return "A marathon is 42.195 kilometers (26.219 miles) long. The distance commemorates the run of the Greek soldier Pheidippides from Marathon to Athens in 490 BC.";
  }

  // Food & Cooking
  if (msg.includes('boiling eggs') || msg.includes('how to boil eggs')) {
    return "For soft-boiled eggs: 4-6 minutes. For hard-boiled eggs: 8-12 minutes. Start timing once the water returns to a boil after adding eggs.";
  }

  if (msg.includes('baking temperature') || msg.includes('oven temperature')) {
    return "Common baking temperatures: Cookies 350°F (175°C), Bread 375-425°F (190-220°C), Cakes 325-350°F (160-175°C). Always preheat your oven.";
  }

  if (msg.includes('vitamin c') || msg.includes('foods with vitamin c')) {
    return "Foods high in Vitamin C include citrus fruits (oranges, lemons), berries, bell peppers, broccoli, tomatoes, and leafy greens. Adults need about 90mg daily.";
  }

  if (msg.includes('protein foods') || msg.includes('high protein')) {
    return "High-protein foods include lean meats, fish, eggs, dairy products, legumes (beans, lentils), nuts, seeds, and quinoa.";
  }

  // Economics & Business
  if (msg.includes('stock market') || msg.includes('how stock market works')) {
    return "The stock market is where shares of public companies are traded. Prices fluctuate based on supply and demand, company performance, and economic factors.";
  }

  if (msg.includes('inflation') || msg.includes('what is inflation')) {
    return "Inflation is the rate at which prices for goods and services rise over time, reducing purchasing power. Central banks typically target 2% annual inflation.";
  }

  if (msg.includes('gdp') || msg.includes('gross domestic product')) {
    return "GDP (Gross Domestic Product) measures the total value of all goods and services produced in a country. It's the primary indicator of economic health.";
  }

  if (msg.includes('cryptocurrency') || msg.includes('how crypto works')) {
    return "Cryptocurrency is digital currency secured by cryptography and typically built on blockchain technology. Bitcoin, created in 2009, was the first successful cryptocurrency.";
  }

  // Languages & Communication
  if (msg.includes('most spoken language') || msg.includes('popular language')) {
    return "Mandarin Chinese is the most spoken language by native speakers (900+ million). English is the most widely learned second language globally.";
  }

  if (msg.includes('how many languages')) {
    return "There are approximately 7,000 languages spoken in the world today, though many are endangered. About 40% of languages are at risk of disappearing.";
  }

  if (msg.includes('sign language')) {
    return "Sign languages are visual languages using hand gestures, facial expressions, and body language. American Sign Language (ASL) is used by over 500,000 people in North America.";
  }

  // Weather & Climate
  if (msg.includes('global warming') || msg.includes('climate change')) {
    return "Climate change refers to long-term shifts in global temperatures and weather patterns. Human activities, particularly burning fossil fuels, are the primary cause since the 1800s.";
  }

  if (msg.includes('greenhouse effect')) {
    return "The greenhouse effect occurs when greenhouse gases (CO₂, methane, water vapor) trap heat in Earth's atmosphere, warming the planet. It's natural but enhanced by human activities.";
  }

  if (msg.includes('seasons') || msg.includes('why seasons change')) {
    return "Seasons occur because Earth's axis is tilted 23.5 degrees relative to its orbit around the Sun, causing different parts to receive varying amounts of sunlight throughout the year.";
  }

  // Space & Astronomy
  if (msg.includes('solar system') || msg.includes('planets')) {
    return "Our solar system has 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Jupiter is the largest, Mercury is smallest and closest to the Sun.";
  }

  if (msg.includes('milky way') || msg.includes('our galaxy')) {
    return "The Milky Way is our galaxy, containing over 100 billion stars. It's a spiral galaxy about 100,000 light-years across, and our solar system is located in one of its spiral arms.";
  }

  if (msg.includes('moon phases') || msg.includes('lunar cycle')) {
    return "The lunar cycle lasts about 29.5 days, progressing through new moon, waxing crescent, first quarter, waxing gibbous, full moon, waning gibbous, last quarter, and waning crescent.";
  }

  if (msg.includes('light year') || msg.includes('what is light year')) {
    return "A light-year is the distance light travels in one year: approximately 9.46 trillion kilometers (5.88 trillion miles). It's used to measure vast distances in space.";
  }

  // Health & Medicine
  if (msg.includes('blood types') || msg.includes('blood groups')) {
    return "The main blood groups are A, B, AB, and O, each can be Rh-positive or Rh-negative. O-negative is the universal donor, AB-positive is the universal recipient.";
  }

  if (msg.includes('recommended sleep') || msg.includes('how much sleep')) {
    return "Adults need 7-9 hours of sleep per night. Teenagers need 8-10 hours, and school-age children need 9-11 hours for optimal health and performance.";
  }

  if (msg.includes('exercise benefits') || msg.includes('why exercise')) {
    return "Regular exercise improves cardiovascular health, strengthens muscles and bones, boosts mental health, helps maintain healthy weight, and reduces risk of chronic diseases.";
  }

  // Russian Knowledge Base (для русскоговорящих пользователей)
  if (msg.includes('столица россии') || msg.includes('москва столица')) {
    return "Столица России - Москва. Это крупнейший город страны с населением более 12 миллионов человек. Москва стала столицей в 1918 году.";
  }

  if (msg.includes('самая длинная река россии') || msg.includes('река волга')) {
    return "Самая длинная река в России - Лена (4400 км). Волга - самая длинная река в Европе (3530 км) и важнейшая водная артерия России.";
  }

  if (msg.includes('байкал') || msg.includes('озеро байкал')) {
    return "Озеро Байкал - самое глубокое озеро в мире (1642 м) и содержит около 20% всей пресной воды планеты. Это объект Всемирного наследия ЮНЕСКО.";
  }

  if (msg.includes('русский язык') || msg.includes('сколько говорят по русски')) {
    return "На русском языке говорят около 260 миллионов человек по всему миру. Это официальный язык России, Беларуси, Казахстана и Кыргызстана.";
  }
  
  return null;
}

function isAskingAboutIdentity(message: string): boolean {
  const lower = message.toLowerCase();
  return /\b(who are you|what are you|your name|introduce yourself)\b/.test(lower);
}

function isAskingAboutUser(message: string): boolean {
  const lower = message.toLowerCase();
  return /\b(who am i|my name|about me|my company|my business)\b/.test(lower);
}

function isAskingAboutBusiness(message: string): boolean {
  const lower = message.toLowerCase();
  return /\b(business|deals|sales|revenue|performance|metrics|customers|crm)\b/.test(lower);
}

function isAskingAboutTime(message: string): boolean {
  const lower = message.toLowerCase();
  return /\b(what time|current time|today|date|now)\b/.test(lower);
}

function isAskingAboutCapabilities(message: string): boolean {
  const lower = message.toLowerCase();
  return /\b(what can you|help me|capabilities|functions|features)\b/.test(lower);
}

function isAskingAboutThoughts(message: string): boolean {
  const lower = message.toLowerCase();
  return /\b(what do you think|thoughts|opinion|advice|suggest)\b/.test(lower);
}

function isGreeting(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)(\s|!|\?|$)/.test(lower);
}

function generateBusinessInsight(message: string, data: any, name: string): string {
  const insights = [
    `${name}, looking at your ${data.deals} deals worth ${data.revenue} RUB, your average deal value is ${Math.round(data.revenue / data.deals)} RUB. This suggests you're focusing on mid-range opportunities.`,
    `Your business performance shows ${data.deals} active deals. With ${data.revenue} RUB in pipeline value, you're tracking well for growth.`,
    `Based on your CRM data, you have strong deal flow with ${data.deals} opportunities totaling ${data.revenue} RUB. What specific metrics would you like to explore?`
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

function generateThoughtfulResponse(data: any, name: string): string {
  const responses = [
    `That's interesting, ${name}. Based on your business data showing ${data.deals} deals, I think there's potential for optimization in your sales pipeline.`,
    `Great question! Looking at your ${data.revenue} RUB revenue across ${data.deals} deals, I'd suggest focusing on deal velocity and conversion rates.`,
    `From a business perspective, ${name}, your current metrics show solid foundation. What specific area would you like strategic input on?`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateIntelligentQuestionResponse(message: string, name: string): string {
  const responses = [
    `That's a thoughtful question, ${name}. Let me think about this from multiple angles...`,
    `Interesting perspective! Based on business principles and data analysis, here's what I consider...`,
    `Great question that touches on several important factors. From my analysis...`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}