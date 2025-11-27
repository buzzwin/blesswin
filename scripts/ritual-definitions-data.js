/**
 * Ritual definitions data for seeding
 * This is a JavaScript version of the TypeScript definitions
 */

module.exports = {
  ritualDefinitions: [
    // Mind Rituals
    {
      title: 'Take 5 Deep Breaths',
      description: 'Before you start your day, pause and breathe. This simple act can reset your nervous system and bring you into the present moment.',
      tags: ['mind'],
      effortLevel: 'tiny',
      scope: 'global',
      suggestedTimeOfDay: 'morning',
      durationEstimate: '2 minutes',
      prefillTemplate: "Today's ritual: I took 5 minutes to breathe and reset. Feeling more centered and present.",
      icon: '🌬️'
    },
    {
      title: 'Write One Gratitude',
      description: 'Take a moment to write down one thing you\'re grateful for today. It can be big or small.',
      tags: ['mind'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'morning',
      durationEstimate: '2 minutes',
      prefillTemplate: "Today's ritual: I wrote down one thing I'm grateful for. Gratitude practice helps shift my perspective.",
      icon: '🙏'
    },
    {
      title: 'Meditate for 3 Minutes',
      description: 'Find a quiet spot and sit with your breath for just 3 minutes. No pressure, just presence.',
      tags: ['mind'],
      effortLevel: 'medium',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '3 minutes',
      prefillTemplate: "Today's ritual: I meditated for 3 minutes. Taking time to pause and breathe helps me feel more grounded.",
      icon: '🧘'
    },
    {
      title: 'Reflect on Today',
      description: 'Before bed, take 2 minutes to reflect on one good thing that happened today.',
      tags: ['mind'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'evening',
      durationEstimate: '2 minutes',
      prefillTemplate: "Today's ritual: I reflected on one good thing from today. Taking time to notice the positive helps me end the day well.",
      icon: '✨'
    },
    // Body Rituals
    {
      title: 'Stretch for 2 Minutes',
      description: 'Take a quick stretch break. Reach for the sky, touch your toes, or do whatever feels good.',
      tags: ['body'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '2 minutes',
      prefillTemplate: "Today's ritual: I took 2 minutes to stretch. Moving my body helps me feel more energized.",
      icon: '🤸'
    },
    {
      title: 'Drink a Glass of Water',
      description: 'Hydrate your body. Start your day with a glass of water to wake up your system.',
      tags: ['body'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'morning',
      durationEstimate: '1 minute',
      prefillTemplate: "Today's ritual: I started my day with a glass of water. Small acts of self-care add up.",
      icon: '💧'
    },
    {
      title: 'Take a 10-Minute Walk',
      description: 'Step outside and walk for 10 minutes. Fresh air and movement can do wonders.',
      tags: ['body'],
      effortLevel: 'medium',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '10 minutes',
      prefillTemplate: "Today's ritual: I took a 10-minute walk. Getting outside and moving helps me feel refreshed.",
      icon: '🚶'
    },
    {
      title: 'Cook a Healthy Meal',
      description: 'Prepare one nutritious meal for yourself or someone you care about.',
      tags: ['body'],
      effortLevel: 'deep',
      scope: 'personalized',
      suggestedTimeOfDay: 'afternoon',
      durationEstimate: '30 minutes',
      prefillTemplate: "Today's ritual: I cooked a healthy meal. Taking time to nourish my body feels like an act of self-care.",
      icon: '🍳'
    },
    // Relationships Rituals
    {
      title: 'Text Someone You Care About',
      description: 'Reach out to someone you haven\'t talked to in a while. A simple message can brighten their day.',
      tags: ['relationships'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '2 minutes',
      prefillTemplate: "Today's ritual: I texted someone I care about. Small connections matter.",
      icon: '💬'
    },
    {
      title: 'Call a Friend or Family Member',
      description: 'Pick up the phone and call someone you love. Hearing their voice can be powerful.',
      tags: ['relationships'],
      effortLevel: 'medium',
      scope: 'personalized',
      suggestedTimeOfDay: 'evening',
      durationEstimate: '10 minutes',
      prefillTemplate: "Today's ritual: I called someone I love. Taking time to connect feels meaningful.",
      icon: '📞'
    },
    {
      title: 'Write a Thank You Note',
      description: 'Write a quick note thanking someone who made a difference in your life.',
      tags: ['relationships'],
      effortLevel: 'medium',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '5 minutes',
      prefillTemplate: "Today's ritual: I wrote a thank you note. Expressing gratitude strengthens connections.",
      icon: '💌'
    },
    {
      title: 'Spend Quality Time with Someone',
      description: 'Set aside 15 minutes to be fully present with someone you care about.',
      tags: ['relationships'],
      effortLevel: 'deep',
      scope: 'personalized',
      suggestedTimeOfDay: 'evening',
      durationEstimate: '15 minutes',
      prefillTemplate: "Today's ritual: I spent quality time with someone I care about. Being present together matters.",
      icon: '❤️'
    },
    // Nature Rituals
    {
      title: 'Look at the Sky',
      description: 'Step outside and look up at the sky for a minute. Notice the clouds, the color, the vastness.',
      tags: ['nature'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '1 minute',
      prefillTemplate: "Today's ritual: I took a moment to look at the sky. Connecting with nature helps me feel grounded.",
      icon: '☁️'
    },
    {
      title: 'Water a Plant',
      description: 'Take care of a plant. Water it, check its leaves, or just appreciate its growth.',
      tags: ['nature'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'morning',
      durationEstimate: '2 minutes',
      prefillTemplate: "Today's ritual: I watered a plant. Taking care of living things feels meaningful.",
      icon: '🌱'
    },
    {
      title: 'Pick Up 5 Pieces of Trash',
      description: 'While walking, pick up 5 pieces of trash you see. Small acts of care for our planet.',
      tags: ['nature'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '5 minutes',
      prefillTemplate: "Today's ritual: I picked up 5 pieces of trash. Small acts of care for our planet add up.",
      icon: '♻️'
    },
    {
      title: 'Spend 15 Minutes Outside',
      description: 'Go outside and spend 15 minutes in nature. Walk, sit, or just be present.',
      tags: ['nature'],
      effortLevel: 'medium',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '15 minutes',
      prefillTemplate: "Today's ritual: I spent 15 minutes outside. Connecting with nature helps me feel refreshed.",
      icon: '🌳'
    },
    // Community Rituals
    {
      title: 'Smile at a Stranger',
      description: 'Offer a genuine smile to someone you pass by. Small acts of kindness ripple outward.',
      tags: ['community'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '1 minute',
      prefillTemplate: "Today's ritual: I smiled at a stranger. Small acts of kindness create connection.",
      icon: '😊'
    },
    {
      title: 'Hold the Door Open',
      description: 'Hold the door open for someone. A simple gesture that shows care.',
      tags: ['community'],
      effortLevel: 'tiny',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '30 seconds',
      prefillTemplate: "Today's ritual: I held the door open for someone. Small gestures of care matter.",
      icon: '🚪'
    },
    {
      title: 'Donate to a Cause',
      description: 'Make a small donation to a cause you care about. Every bit helps.',
      tags: ['community'],
      effortLevel: 'medium',
      scope: 'personalized',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '5 minutes',
      prefillTemplate: "Today's ritual: I donated to a cause I care about. Supporting others feels meaningful.",
      icon: '💝'
    },
    {
      title: 'Volunteer for 30 Minutes',
      description: 'Spend 30 minutes volunteering for a local organization or cause.',
      tags: ['community'],
      effortLevel: 'deep',
      scope: 'personalized',
      suggestedTimeOfDay: 'afternoon',
      durationEstimate: '30 minutes',
      prefillTemplate: "Today's ritual: I volunteered for 30 minutes. Giving time to others creates positive impact.",
      icon: '🤝'
    }
  ]
};

