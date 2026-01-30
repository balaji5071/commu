export interface Gift {
    name: string;
    emoji: string;
    image?: string;
}

export const GIFTS: Gift[] = [
    { name: "an ink pen", emoji: "🖊️", image: "/assets/ink-pen.png" },
    { name: "a vintage car", emoji: "🚗", image: "/assets/vintage-car.png" },
    { name: "a glowing cube", emoji: "🔮" },
    { name: "an invisible cloak", emoji: "👻" },
    { name: "a bucket of endless popcorn", emoji: "🍿" },
    { name: "a tiny elephant", emoji: "🐘" },
    { name: "a screaming potato", emoji: "🥔" },
    { name: "a dancing cactus", emoji: "🌵" },
    { name: "a rainbow umbrella", emoji: "🌈" },
    { name: "a singing teapot", emoji: "🫖" },
    { name: "a flying carpet", emoji: "🪄" },
    { name: "a time-traveling watch", emoji: "⌚" },
    { name: "a magic cauldron", emoji: "🪄" },
    { name: "a mood ring", emoji: "💍" },
    { name: "a teleporting backpack", emoji: "🎒" },
    { name: "a fortune-telling fishbowl", emoji: "🐟" },
    { name: "a gravity-defying skateboard", emoji: "🛹" },
    { name: "a whispering tree", emoji: "🌳" },
    { name: "a laughing mirror", emoji: "🪞" },
    { name: "a self-playing guitar", emoji: "🎸" },
    { name: "a cloud in a bottle", emoji: "☁️" },
    { name: "a phoenix feather", emoji: "🪶" },
    { name: "a bottomless coffee mug", emoji: "☕" },
    { name: "a glowing mushroom lamp", emoji: "🍄" },
    { name: "a magic compass", emoji: "🧭" },
    { name: "a self-writing book", emoji: "📖" },
    { name: "a snowglobe city", emoji: "🏙️" },
    { name: "rocket shoes", emoji: "👟" },
    { name: "a crystal ball", emoji: "🔮" },
    { name: "a magic harmonica", emoji: "🎵" },
    { name: "a talking parrot", emoji: "🦜" },
    { name: "a levitating orb", emoji: "🌐" },
    { name: "enchanted sunglasses", emoji: "🕶️" },
    { name: "a miniature dragon", emoji: "🐉" },
    { name: "a music box of memories", emoji: "🎶" },
    { name: "a floating lantern", emoji: "🏮" },
    { name: "a telepathic headband", emoji: "👑" },
    { name: "shape-shifting clay", emoji: "🧱" },
    { name: "a perpetual motion marble", emoji: "⚫" },
    { name: "a dream catcher", emoji: "🕸️" },
    { name: "an echo stone", emoji: "🪨" },
    { name: "a puzzle box of wishes", emoji: "📦" },
    { name: "a holographic sticker", emoji: "✨" },
    { name: "a wind-up butterfly", emoji: "🦋" },
    { name: "a pocket dimension", emoji: "🌌" },
    { name: "a truth-telling dice", emoji: "🎲" },
    { name: "a magical yo-yo", emoji: "🪀" },
    { name: "a never-melting ice cube", emoji: "🧊" },
    { name: "a spell-casting wand", emoji: "🪄" },
    { name: "a friendly ghost", emoji: "👻" },
    { name: "a talking hat", emoji: "🎩" },
    { name: "memory pearls", emoji: "📿" },
];

export const getRandomGift = (): Gift => {
    return GIFTS[Math.floor(Math.random() * GIFTS.length)];
};

export const extractKeywords = (text: string): string[] => {
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'it', 'this', 'that', 'these', 'those',
        'i', 'you', 'we', 'they', 'and', 'or', 'but', 'so', 'because',
        'for', 'with', 'about', 'like', 'love', 'really', 'very', 'just'
    ]);

    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

    return words.slice(0, 3); // Return top 3 keywords
};

interface AIResponseContext {
    gift: Gift;
    keywords: string[];
    flow: 'receiving' | 'giving';
    stage: 'justification' | 'reaction' | 'reflection';
}

export const generateAIResponse = (context: AIResponseContext): string => {
    const { gift, keywords, flow, stage } = context;

    if (flow === 'receiving' && stage === 'justification') {
        // AI explains why they gave the gift
        const templates = [
            `I gave you ${gift.name} because ${keywords.length > 0 ? `you mentioned "${keywords[0]}"` : 'it felt right'} and I thought you'd appreciate its magic!`,
            `${gift.name} ${gift.name.startsWith('a') ? 'is' : 'are'} perfect for you! ${keywords.length > 0 ? `I sensed your interest in ${keywords.join(' and ')}` : 'It matches your energy'}.`,
            `You deserve ${gift.name}! ${keywords.length > 0 ? `Your words about ${keywords[0]} inspired this choice` : 'Something about it reminded me of you'}.`,
            `I picked ${gift.name} specifically for you ${keywords.length > 0 ? `because ${keywords[0]} is clearly important to you` : 'based on our friendship'}!`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    if (flow === 'giving' && stage === 'reaction') {
        // AI reacts to receiving a gift
        const reactions = [
            "Whoa! I didn't expect that! This is amazing! 😍",
            "No way! This is exactly what I needed! How did you know?! ✨",
            "This is hilarious but I absolutely love it! 😂",
            "You're giving me THAT?! That's so creative! 🎉",
            "I'm speechless! This is incredible! 🤩",
            "Oh my gosh, thank you! This is perfect! 💝",
        ];
        return reactions[Math.floor(Math.random() * reactions.length)];
    }

    if (flow === 'giving' && stage === 'reflection') {
        // AI reflects on the explanation
        const reflections = [
            `That actually makes so much sense! ${keywords.length > 0 ? `I love how you connected it to ${keywords[0]}` : 'You really thought this through'}.`,
            `Wow, you always notice the little details. ${keywords.length > 0 ? `The way you explained ${keywords[0]} was beautiful` : 'That\'s so thoughtful'}.`,
            `I'm genuinely touched. ${keywords.length > 0 ? `Your point about ${keywords[0]} really resonates with me` : 'This means a lot'}.`,
            `You know me so well! ${keywords.length > 0 ? `I can't believe you remembered about ${keywords[0]}` : 'This is exactly my style'}.`,
            `This is why we're friends! ${keywords.length > 0 ? `Your insight about ${keywords[0]} is spot on` : 'You get me'}.`,
        ];
        return reflections[Math.floor(Math.random() * reflections.length)];
    }

    return "That's amazing!";
};

export const getEncouragingMessage = (): string => {
    const messages = [
        "Great spontaneity! 🌟",
        "Nice instinctive response! ⚡",
        "Wonderful creativity! ✨",
        "You're a natural! 🎯",
        "Brilliant choice! 💫",
        "That was perfect timing! ⏰",
        "Love your energy! 🔥",
        "Amazing connection! 🤝",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};
