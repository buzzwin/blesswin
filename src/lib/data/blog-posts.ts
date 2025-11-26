export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  updatedAt?: string;
  category: 'yoga' | 'mindfulness' | 'meditation' | 'harmony' | 'wellness';
  tags: string[];
  image?: string;
  readingTime: number; // in minutes
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'beginner-yoga-poses-for-inner-peace',
    title: '5 Beginner Yoga Poses to Cultivate Inner Peace',
    excerpt:
      "Discover simple yet powerful yoga poses that can help you find calm and peace, even if you're just starting your yoga journey.",
    content: `# 5 Beginner Yoga Poses to Cultivate Inner Peace

Yoga is a beautiful practice that connects the body, mind, and spirit. If you're new to yoga, these five beginner-friendly poses are perfect for starting your journey toward inner peace.

## 1. Child's Pose (Balasana)

Child's Pose is a restorative pose that helps calm the mind and release tension in the back and shoulders.

**How to practice:**
- Start on your hands and knees
- Sit back on your heels
- Lower your forehead to the mat
- Extend your arms forward or rest them alongside your body
- Hold for 5-10 deep breaths

**Benefits:** Reduces stress, calms the nervous system, and promotes relaxation.

## 2. Mountain Pose (Tadasana)

This foundational standing pose teaches proper alignment and helps you feel grounded and centered.

**How to practice:**
- Stand with your feet hip-width apart
- Distribute weight evenly across both feet
- Lengthen your spine, relax your shoulders
- Bring your palms together at your heart center
- Hold for 5-10 breaths

**Benefits:** Improves posture, increases awareness, and promotes mental clarity.

## 3. Cat-Cow Pose (Marjaryasana-Bitilasana)

This gentle flow helps warm up the spine and connects breath with movement.

**How to practice:**
- Start on hands and knees
- Inhale: Arch your back, lift your head and tailbone (Cow)
- Exhale: Round your spine, tuck your chin (Cat)
- Repeat 10-15 times, moving with your breath

**Benefits:** Increases spinal flexibility, relieves back tension, and calms the mind.

## 4. Legs-Up-the-Wall Pose (Viparita Karani)

A restorative inversion that's perfect for relaxation and stress relief.

**How to practice:**
- Sit sideways next to a wall
- Swing your legs up the wall as you lie down
- Keep your arms relaxed at your sides
- Hold for 5-15 minutes

**Benefits:** Reduces anxiety, improves circulation, and promotes deep relaxation.

## 5. Corpse Pose (Savasana)

The ultimate relaxation pose that allows your body and mind to fully integrate the practice.

**How to practice:**
- Lie flat on your back
- Let your feet fall naturally apart
- Rest your arms alongside your body, palms up
- Close your eyes and breathe naturally
- Stay for 5-10 minutes

**Benefits:** Reduces stress, lowers blood pressure, and promotes deep rest.

## Creating Your Practice

Start with just 10-15 minutes a day. Remember, yoga is not about perfection—it's about showing up for yourself with compassion and patience. Each pose is an opportunity to connect with your breath and find peace in the present moment.

As you practice these poses regularly, you'll notice increased calm, better sleep, and a greater sense of inner peace. Remember, the journey toward peace begins with a single breath.

*Namaste*`,
    author: 'Buzzwin Team',
    publishedAt: '2024-01-15',
    category: 'yoga',
    tags: ['yoga', 'beginner', 'inner peace', 'wellness', 'poses'],
    readingTime: 5,
    featured: true
  },
  {
    slug: 'mindfulness-daily-life',
    title: 'How to Practice Mindfulness in Your Daily Life',
    excerpt:
      'Learn simple mindfulness techniques you can incorporate into everyday activities to reduce stress and find peace.',
    content: `# How to Practice Mindfulness in Your Daily Life

Mindfulness doesn't require special equipment or hours of meditation. You can practice it throughout your day, in ordinary moments. Here's how to bring mindfulness into your daily life.

## What is Mindfulness?

Mindfulness is the practice of paying attention to the present moment with curiosity, openness, and acceptance. It's about being fully present rather than lost in thoughts about the past or future.

## Simple Daily Mindfulness Practices

### 1. Mindful Morning Routine

Start your day with intention. As you wake up, take three deep breaths before getting out of bed. Notice how your body feels. When brushing your teeth, pay attention to the sensations—the taste of toothpaste, the feeling of the brush.

### 2. Mindful Eating

Instead of eating while distracted, try eating mindfully:
- Notice the colors, textures, and aromas of your food
- Take small bites and chew slowly
- Put down your fork between bites
- Savor each flavor

This practice improves digestion and helps you appreciate your food more.

### 3. Mindful Walking

Whether you're walking to work or taking a break, practice mindful walking:
- Feel your feet connecting with the ground
- Notice your breath
- Observe your surroundings without judgment
- Walk at a comfortable pace

### 4. Mindful Breathing Breaks

Set reminders throughout your day to take mindful breathing breaks:
- Stop what you're doing
- Take 5 deep breaths
- Notice how you feel
- Return to your activity with renewed awareness

### 5. Mindful Listening

When someone is speaking to you:
- Put away distractions
- Make eye contact
- Listen without planning your response
- Notice your reactions without judgment

### 6. Mindful Chores

Transform mundane tasks into mindfulness practice:
- When washing dishes, feel the warm water
- When folding laundry, notice the textures
- When cleaning, pay attention to each movement

## Overcoming Common Challenges

**"I don't have time"** - Start with just one minute. Mindfulness can be practiced in micro-moments throughout your day.

**"I keep forgetting"** - Set reminders on your phone or place sticky notes in visible places.

**"My mind wanders"** - That's normal! Gently bring your attention back without judgment.

## The Ripple Effect

When you practice mindfulness regularly, you'll notice:
- Reduced stress and anxiety
- Better focus and concentration
- Improved relationships
- Greater appreciation for life's simple pleasures
- Increased emotional regulation

## Starting Your Practice

Choose one practice to start with this week. Commit to doing it daily. After a week, notice how you feel. Then add another practice. Remember, mindfulness is a journey, not a destination. Every moment is a new opportunity to be present.

*May your mindfulness practice bring you peace and joy.*`,
    author: 'Buzzwin Team',
    publishedAt: '2024-01-20',
    category: 'mindfulness',
    tags: [
      'mindfulness',
      'daily practice',
      'stress relief',
      'wellness',
      'present moment'
    ],
    readingTime: 7,
    featured: true
  },
  {
    slug: 'meditation-for-beginners',
    title: 'A Complete Guide to Meditation for Beginners',
    excerpt:
      'Everything you need to know to start your meditation practice, including techniques, tips, and common challenges.',
    content: `# A Complete Guide to Meditation for Beginners

Meditation is a powerful practice that can transform your life, but starting can feel overwhelming. This guide will help you begin your meditation journey with confidence.

## What is Meditation?

Meditation is a practice of training your mind to focus and redirect your thoughts. It's not about stopping your thoughts, but rather observing them without judgment and returning your attention to your chosen focus.

## Benefits of Meditation

Regular meditation practice offers numerous benefits:
- Reduced stress and anxiety
- Improved emotional well-being
- Better focus and concentration
- Enhanced self-awareness
- Lower blood pressure
- Improved sleep quality
- Increased compassion and empathy

## Getting Started: Your First Meditation

### 1. Find a Quiet Space

Choose a place where you won't be disturbed. It doesn't need to be completely silent—just relatively quiet.

### 2. Set a Time Limit

Start with just 5 minutes. You can gradually increase as you become more comfortable.

### 3. Sit Comfortably

You don't need to sit in lotus position. Find a comfortable seated position:
- Sit on a cushion, chair, or the floor
- Keep your back straight but not rigid
- Rest your hands on your knees or in your lap
- Close your eyes or soften your gaze

### 4. Focus on Your Breath

- Notice your natural breathing rhythm
- Don't try to control it—just observe
- When your mind wanders, gently return to your breath
- Be patient and kind with yourself

## Common Meditation Techniques

### Breath Awareness Meditation

Focus your attention on your breath. Notice the sensation of air entering and leaving your nostrils, or the rise and fall of your chest.

### Body Scan Meditation

Slowly move your attention through different parts of your body, noticing sensations without judgment.

### Loving-Kindness Meditation

Cultivate feelings of love and compassion by silently repeating phrases like:
- "May I be happy"
- "May I be healthy"
- "May I be at peace"

Then extend these wishes to others.

### Walking Meditation

Meditate while walking slowly, paying attention to each step and the sensations in your body.

## Common Challenges and Solutions

### "I can't stop thinking"

This is normal! Meditation isn't about stopping thoughts. When you notice your mind wandering, gently return to your breath. This is the practice.

### "I fall asleep"

Try meditating earlier in the day, or sit upright instead of lying down. You can also try walking meditation.

### "I don't have time"

Start with just 2-3 minutes. Even brief meditation sessions are beneficial.

### "I'm not doing it right"

There's no "right" way to meditate. The act of showing up and trying is what matters.

## Building a Consistent Practice

### Start Small

Begin with 5 minutes daily. Consistency is more important than duration.

### Create a Routine

Meditate at the same time each day. Morning meditation can set a positive tone for your day.

### Use Guided Meditations

Apps, videos, or audio guides can be helpful, especially when starting out.

### Be Patient

Meditation is a skill that develops over time. Be patient and compassionate with yourself.

### Track Your Progress

Notice how you feel before and after meditation. Keep a simple journal of your experiences.

## Tips for Success

1. **Don't judge yourself** - Every meditation session is different. Some days will be easier than others.

2. **Start fresh each day** - Don't worry about yesterday's session. Each meditation is a new beginning.

3. **Find a community** - Consider joining a meditation group or finding an online community for support.

4. **Experiment** - Try different techniques to find what works best for you.

5. **Be consistent** - Regular practice, even if brief, is more beneficial than occasional long sessions.

## Your Meditation Journey

Remember, meditation is a journey, not a destination. There's no finish line—every moment of practice is valuable. Start where you are, be patient with yourself, and trust the process.

As you continue your practice, you'll discover that meditation isn't just something you do—it becomes a way of being, a way of living with greater awareness, compassion, and peace.

*May your meditation practice bring you peace, clarity, and joy.*`,
    author: 'Buzzwin Team',
    publishedAt: '2024-01-25',
    category: 'meditation',
    tags: ['meditation', 'beginner', 'guide', 'wellness', 'inner peace'],
    readingTime: 10,
    featured: true
  },
  {
    slug: 'finding-harmony-life',
    title: 'Finding Harmony: Balancing Work, Life, and Inner Peace',
    excerpt:
      'Discover practical strategies for creating balance and harmony in all aspects of your life, from work to relationships to personal growth.',
    content: `# Finding Harmony: Balancing Work, Life, and Inner Peace

In our fast-paced world, finding harmony can feel like an impossible task. But harmony isn't about perfect balance—it's about creating a life that feels aligned with your values and brings you peace.

## What is Harmony?

Harmony is a state of balance and peace where different aspects of your life work together in a way that feels sustainable and fulfilling. It's not about perfection, but about creating a life that supports your well-being.

## The Four Pillars of Harmony

### 1. Physical Harmony

Your body is your foundation. Physical harmony includes:
- Regular movement and exercise
- Nourishing food
- Adequate rest and sleep
- Listening to your body's needs

**Practice:** Take a 10-minute walk daily, prioritize sleep, and eat mindfully.

### 2. Mental Harmony

Mental harmony involves:
- Managing stress effectively
- Setting healthy boundaries
- Practicing self-compassion
- Engaging in activities that challenge and fulfill you

**Practice:** Set aside time for activities you enjoy, learn to say no, and practice positive self-talk.

### 3. Emotional Harmony

Emotional harmony means:
- Acknowledging and processing your feelings
- Building healthy relationships
- Practicing empathy and compassion
- Finding healthy outlets for emotions

**Practice:** Journal about your feelings, express gratitude daily, and nurture meaningful connections.

### 4. Spiritual Harmony

Spiritual harmony involves:
- Connecting with your values and purpose
- Practicing mindfulness or meditation
- Finding meaning in daily life
- Contributing to something greater than yourself

**Practice:** Spend time in nature, meditate, volunteer, or engage in creative activities.

## Practical Strategies for Harmony

### 1. Set Clear Priorities

Identify what truly matters to you. Make a list of your top 5 priorities and let them guide your decisions.

### 2. Create Boundaries

Learn to say no to things that don't align with your priorities. Protect your time and energy.

### 3. Practice Time Blocking

Schedule time for different aspects of your life:
- Work time
- Family time
- Self-care time
- Rest time

### 4. Embrace Imperfection

Harmony doesn't mean everything is perfect. Some days will be more balanced than others, and that's okay.

### 5. Regular Check-Ins

Take time weekly to assess how balanced you feel. Adjust as needed.

### 6. Simplify

Simplify your life by:
- Decluttering your space
- Reducing commitments
- Focusing on what truly matters
- Letting go of perfectionism

## Creating Harmony in Relationships

### With Yourself

- Practice self-compassion
- Set aside time for self-care
- Honor your needs and limits
- Celebrate your progress

### With Others

- Communicate openly and honestly
- Set healthy boundaries
- Practice active listening
- Show appreciation and gratitude

### With Work

- Set clear work-life boundaries
- Take regular breaks
- Find meaning in your work
- Maintain perspective

## The Role of Mindfulness

Mindfulness is key to harmony because it helps you:
- Stay present and aware
- Recognize when you're out of balance
- Make conscious choices
- Respond rather than react

Practice mindfulness throughout your day to maintain awareness of your needs and limits.

## Overcoming Obstacles to Harmony

**Guilt** - Remember that taking care of yourself isn't selfish—it's necessary.

**Perfectionism** - Let go of the idea that everything must be perfect. Good enough is often enough.

**Comparison** - Your harmony looks different from others'. Focus on what works for you.

**Overcommitment** - Learn to say no. Every yes to something is a no to something else.

## Your Path to Harmony

Remember, harmony is a journey, not a destination. It requires ongoing attention and adjustment. Be patient with yourself and celebrate small wins along the way.

As you work toward harmony, you'll find that peace within yourself naturally extends outward, contributing to harmony in your relationships, your community, and ultimately, the world.

*May you find harmony in all aspects of your life, and may that harmony ripple outward to create peace in the world.*`,
    author: 'Buzzwin Team',
    publishedAt: '2024-02-01',
    category: 'harmony',
    tags: [
      'harmony',
      'balance',
      'work-life balance',
      'wellness',
      'inner peace'
    ],
    readingTime: 8,
    featured: true
  },
  {
    slug: 'breathing-techniques-stress',
    title: '5 Breathing Techniques to Reduce Stress Instantly',
    excerpt:
      'Learn powerful breathing exercises that can help you calm your nervous system and find peace in moments of stress.',
    content: `# 5 Breathing Techniques to Reduce Stress Instantly

Your breath is always with you, making it one of the most accessible tools for managing stress. These five breathing techniques can help you find calm in moments of stress.

## 1. Box Breathing (4-4-4-4)

Also known as square breathing, this technique is used by Navy SEALs to stay calm under pressure.

**How to practice:**
- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Hold for 4 counts
- Repeat 4-6 times

**When to use:** Before important meetings, when feeling anxious, or to improve focus.

## 2. 4-7-8 Breathing

This technique activates your body's relaxation response.

**How to practice:**
- Inhale through your nose for 4 counts
- Hold your breath for 7 counts
- Exhale through your mouth for 8 counts
- Repeat 4-8 times

**When to use:** For sleep, anxiety, or when you need deep relaxation.

## 3. Belly Breathing (Diaphragmatic Breathing)

This technique engages your diaphragm and activates your parasympathetic nervous system.

**How to practice:**
- Place one hand on your chest, one on your belly
- Inhale deeply through your nose, feeling your belly rise
- Exhale slowly through your mouth, feeling your belly fall
- Continue for 5-10 minutes

**When to use:** Daily practice, during stressful moments, or to improve overall well-being.

## 4. Alternate Nostril Breathing (Nadi Shodhana)

A yogic breathing technique that balances the left and right hemispheres of the brain.

**How to practice:**
- Close your right nostril with your thumb
- Inhale through your left nostril
- Close your left nostril, release your right
- Exhale through your right nostril
- Inhale through your right nostril
- Close your right, release your left
- Exhale through your left nostril
- Repeat 5-10 cycles

**When to use:** For mental clarity, balance, or when feeling overwhelmed.

## 5. Lion's Breath (Simhasana)

A powerful technique for releasing tension and stress.

**How to practice:**
- Inhale deeply through your nose
- Exhale forcefully through your mouth, sticking out your tongue
- Make a "ha" sound as you exhale
- Repeat 3-5 times

**When to use:** When you need to release tension quickly or feel stuck energy.

## Tips for Effective Breathing Practice

1. **Practice regularly** - The more you practice, the more effective these techniques become.

2. **Find a quiet space** - Especially when learning, find a place where you won't be disturbed.

3. **Be patient** - It may take time to feel the effects. Keep practicing.

4. **Listen to your body** - If you feel dizzy, slow down or stop.

5. **Combine with mindfulness** - Pay attention to how your body feels as you breathe.

## The Science Behind Breathing

Deep, slow breathing activates your parasympathetic nervous system, which:
- Lowers heart rate
- Reduces blood pressure
- Decreases stress hormones
- Promotes relaxation
- Improves focus and clarity

## Creating a Breathing Practice

Start by choosing one technique that resonates with you. Practice it daily for a week, then try another. Over time, you'll develop a toolkit of breathing techniques you can use in different situations.

Remember, your breath is always available to you. Whenever you feel stressed, anxious, or overwhelmed, take a moment to breathe. It's one of the simplest yet most powerful tools for finding peace.

*May your breath bring you peace and calm in every moment.*`,
    author: 'Buzzwin Team',
    publishedAt: '2024-02-05',
    category: 'wellness',
    tags: ['breathing', 'stress relief', 'wellness', 'techniques', 'calm'],
    readingTime: 6,
    featured: false
  },
  {
    slug: 'world-peace-begins-within',
    title:
      'World Peace Begins Within: How Individual Transformation Creates Global Change',
    excerpt:
      'Explore how finding inner peace and practicing compassion can create a ripple effect that contributes to world peace.',
    content: `# World Peace Begins Within: How Individual Transformation Creates Global Change

The journey to world peace begins with a single person—you. When you find peace within yourself, you naturally spread that peace to others, creating a ripple effect that extends far beyond yourself.

## The Ripple Effect of Inner Peace

Imagine dropping a pebble into a still pond. The ripples extend outward, touching everything in their path. Similarly, when you cultivate inner peace, your peace ripples outward, affecting:

- Your immediate relationships
- Your community
- Your interactions with strangers
- The collective consciousness
- The world at large

## How Individual Peace Creates Global Change

### 1. Transformed Relationships

When you're at peace, you:
- Communicate more effectively
- Respond rather than react
- Show more compassion and understanding
- Resolve conflicts peacefully
- Create harmony in your relationships

These peaceful relationships become models for others.

### 2. Positive Energy

Your inner peace generates positive energy that:
- Affects those around you
- Creates a more harmonious environment
- Inspires others to seek peace
- Contributes to collective well-being

### 3. Conscious Choices

When you're centered and peaceful, you make choices that:
- Align with your values
- Consider the greater good
- Promote harmony and understanding
- Reduce conflict and division

### 4. Modeling Peace

By living peacefully, you:
- Show others that peace is possible
- Demonstrate peaceful conflict resolution
- Inspire others to seek inner peace
- Create a culture of peace

## Practices for Cultivating Inner Peace

### Daily Meditation

Even 10 minutes of daily meditation can transform your inner landscape and help you find peace.

### Mindfulness Practice

Stay present and aware throughout your day, responding to situations from a place of peace rather than reactivity.

### Compassion Practice

Cultivate compassion for yourself and others. Remember that everyone is doing their best with what they have.

### Gratitude

Practice gratitude daily. Appreciating what you have helps you find peace in the present moment.

### Service

Contribute to something greater than yourself. Service helps you connect with others and find meaning.

## The Power of Collective Intention

When many individuals practice peace, their combined intention creates a powerful force for change. This is why individual transformation matters so much.

## Starting Your Journey

Your journey toward inner peace doesn't require perfection. It simply requires:
- Showing up daily
- Practicing with compassion
- Being patient with yourself
- Trusting the process

## Remember

Every moment you choose peace over reactivity, compassion over judgment, and love over fear, you contribute to world peace. Your transformation matters. Your peace matters. You matter.

Together, through individual transformation, we can create a more peaceful world—one peaceful thought, one peaceful action, one peaceful person at a time.

*May your inner peace ripple outward, touching all beings and contributing to world peace.*`,
    author: 'Buzzwin Team',
    publishedAt: '2024-02-10',
    category: 'harmony',
    tags: [
      'world peace',
      'inner peace',
      'transformation',
      'harmony',
      'compassion'
    ],
    readingTime: 7,
    featured: true
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostsByCategory(
  category: BlogPost['category']
): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

export function getRecentBlogPosts(limit?: number): BlogPost[] {
  const sorted = [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}
