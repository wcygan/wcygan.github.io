interface Welcome {
    language: string;
    text: string;
}

const welcomeMessages: Welcome[] = [
    { language: 'English', text: 'Welcome!' },
    { language: 'Spanish', text: '¡Bienvenido!' },
    { language: 'French', text: 'Bienvenue!' },
    { language: 'German', text: 'Willkommen!' },
    { language: 'Italian', text: 'Benvenuto!' },
    { language: 'Portuguese', text: 'Bem-vindo!' },
    { language: 'Japanese', text: 'ようこそ!' },
    { language: 'Korean', text: '환영합니다!' },
    { language: 'Chinese', text: '欢迎!' },
    { language: 'Ukrainian', text: 'Ласкаво просимо!' },
    { language: 'Arabic', text: '!مرحباً' },
    { language: 'Hindi', text: 'स्वागत है!' },
    { language: 'Greek', text: 'Καλώς ήρθατε!' },
    { language: 'Turkish', text: 'Hoş geldiniz!' },
    { language: 'Polish', text: 'Witamy!' },
    { language: 'Hungarian', text: 'Üdvözlünk!' },
    { language: 'Romanian', text: 'Bun venit!' }
];

export function getRandomWelcome(): Welcome {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
}
