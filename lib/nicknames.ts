// Fun anonymous nicknames for reviewers
const adjectives = [
  "Crazy", "Arsonist", "Sneaky", "Wild", "Mysterious", "Epic", "Cool", "Swift",
  "Bold", "Clever", "Wise", "Brave", "Fierce", "Gentle", "Bright", "Dark",
  "Silent", "Loud", "Quick", "Slow", "Tiny", "Huge", "Happy", "Grumpy"
];

const nouns = [
  "Duck", "Shark", "Tiger", "Eagle", "Wolf", "Bear", "Fox", "Lion",
  "Panda", "Koala", "Owl", "Hawk", "Falcon", "Dragon", "Phoenix", "Unicorn",
  "Narwhal", "Octopus", "Dolphin", "Whale", "Penguin", "Flamingo", "Peacock", "Raven"
];

export function generateAnonymousNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

