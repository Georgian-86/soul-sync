require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 20 unique, high-quality mental health posts
const qualityPosts = [
  {
    title: "Understanding Anxiety: It's More Than Just Worry",
    content: "Anxiety is a normal human emotion, but when it becomes overwhelming and persistent, it can interfere with daily life. Physical symptoms like rapid heartbeat, sweating, and difficulty breathing are common. Remember: anxiety is treatable. Cognitive-behavioral therapy (CBT), mindfulness practices, and sometimes medication can significantly help. You're not alone in this journey, and seeking help is a sign of strength, not weakness.",
    category: "mental-health"
  },
  {
    title: "The Power of a Morning Routine for Mental Wellness",
    content: "Starting your day with intention can transform your mental health. A consistent morning routine signals to your brain that you're in control. Try this: Wake up at the same time, drink water, practice 5 minutes of deep breathing, and set one positive intention for the day. Avoid checking your phone immediately. This simple practice can reduce stress and increase focus throughout your day.",
    category: "wellness"
  },
  {
    title: "Breaking the Stigma: Mental Health is Health",
    content: "Mental health conditions are medical conditions, not character flaws. Depression, anxiety, and other disorders have biological, psychological, and social components. Just as you wouldn't judge someone for having diabetes, mental health conditions deserve the same respect and treatment. If you're struggling, reach out. Therapy, support groups, and professional help are available and effective.",
    category: "mental-health"
  },
  {
    title: "5-Minute Breathing Exercise for Instant Calm",
    content: "When stress hits, try the 4-7-8 breathing technique: Breathe in through your nose for 4 counts, hold for 7 counts, exhale through your mouth for 8 counts. Repeat 4 times. This activates your parasympathetic nervous system, naturally calming your body and mind. Practice this daily, and it becomes even more effective during high-stress moments.",
    category: "stress-management"
  },
  {
    title: "Sleep and Mental Health: The Connection You Can't Ignore",
    content: "Poor sleep doesn't just make you tired—it significantly impacts your mental health. Sleep deprivation can worsen anxiety, depression, and mood disorders. Aim for 7-9 hours of quality sleep. Create a sleep sanctuary: cool room (65-68°F), complete darkness, no screens 1 hour before bed. If sleep problems persist for more than two weeks, consult a healthcare provider.",
    category: "wellness"
  },
  {
    title: "Social Connection: The Antidote to Loneliness",
    content: "Humans are social beings. Chronic loneliness can be as harmful to health as smoking 15 cigarettes a day. Quality matters more than quantity—one deep friendship is more valuable than many superficial connections. Reach out to someone today. Send a message, make a call, or schedule a coffee date. Small actions create meaningful connections.",
    category: "relationships"
  },
  {
    title: "Recognizing Depression: Beyond Feeling Sad",
    content: "Depression isn't just sadness—it's a persistent low mood lasting at least two weeks, accompanied by loss of interest in activities you once enjoyed, changes in sleep and appetite, fatigue, difficulty concentrating, and sometimes thoughts of self-harm. If you're experiencing these symptoms, please reach out to a mental health professional. Depression is highly treatable with therapy, medication, or both.",
    category: "mental-health"
  },
  {
    title: "The Science of Gratitude: Rewiring Your Brain",
    content: "Practicing gratitude literally changes your brain. Research shows it increases dopamine and serotonin—your brain's 'feel-good' chemicals. Keep a gratitude journal: Each night, write three specific things you're grateful for. Be detailed: instead of 'my family,' write 'my sister's supportive text message today.' This practice builds resilience and improves overall well-being.",
    category: "wellness"
  },
  {
    title: "Mindfulness: Your Mental Health Superpower",
    content: "Mindfulness means being fully present in this moment without judgment. It's not about emptying your mind, but observing your thoughts without getting caught up in them. Start small: Take one mindful breath right now. Notice the sensation of air entering and leaving your nose. That's mindfulness. Practice this throughout your day—while eating, walking, or washing dishes.",
    category: "mindfulness"
  },
  {
    title: "Setting Healthy Boundaries Without Guilt",
    content: "Boundaries aren't walls—they're guidelines that protect your peace. It's okay to say no. It's okay to need space. It's okay to prioritize your mental health. Start with small boundaries: 'I need 30 minutes alone after work' or 'I don't discuss politics at family dinners.' Communicate clearly and kindly. Remember: you're not responsible for others' reactions to your boundaries.",
    category: "self-care"
  },
  {
    title: "Exercise and Mental Health: Move Your Body, Lift Your Mood",
    content: "Exercise is as effective as antidepressants for mild to moderate depression. You don't need intense workouts—a 20-minute walk in nature can significantly improve mood. Exercise releases endorphins, reduces stress hormones, improves sleep, and boosts self-esteem. Find movement you enjoy: dancing, swimming, yoga, or walking. Consistency matters more than intensity.",
    category: "wellness"
  },
  {
    title: "Managing Panic Attacks: What to Do When Anxiety Peaks",
    content: "During a panic attack, remember: it feels terrifying, but it's not dangerous. You're not dying or going crazy. Use the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, 1 thing you taste. This brings you back to the present moment. Breathe slowly. The attack will pass, usually within 10-20 minutes.",
    category: "stress-management"
  },
  {
    title: "Nutrition for Mental Health: You Are What You Eat",
    content: "Your gut and brain are directly connected. What you eat affects your mood, energy, and mental clarity. Foods that support mental health: fatty fish (omega-3s), leafy greens, berries, nuts, whole grains, and fermented foods. Limit processed foods, excess sugar, and alcohol. Stay hydrated—even mild dehydration affects mood and cognition. Nutrition isn't a cure, but it's a powerful tool.",
    category: "wellness"
  },
  {
    title: "Overcoming Social Anxiety: Small Steps, Big Changes",
    content: "Social anxiety is the fear of being judged or embarrassed in social situations. Treatment starts with small exposures: make eye contact with a cashier, say hello to a neighbor, then gradually increase challenges. Remember: most people are focused on themselves, not judging you. Therapy, particularly CBT, is highly effective. You don't have to face this alone.",
    category: "mental-health"
  },
  {
    title: "Digital Detox: Reclaim Your Mental Space",
    content: "Constant connectivity exhausts your brain. Social media comparison fuels anxiety and depression. Try a mini digital detox: No phones for the first hour after waking and the last hour before bed. Turn off non-essential notifications. Designate phone-free zones (bedroom, dining table). Notice how your mental clarity and sleep improve. Your phone is a tool—don't let it control you.",
    category: "self-care"
  },
  {
    title: "Understanding Trauma: Your Body Keeps the Score",
    content: "Trauma isn't just major events—it's anything that overwhelms your ability to cope. Your body stores trauma, manifesting as physical symptoms, hypervigilance, or emotional numbness. Healing is possible through trauma-informed therapy (EMDR, somatic experiencing, CBT). Be patient with yourself. Healing isn't linear. You're not broken; you're responding to extraordinary circumstances in ordinary ways.",
    category: "mental-health"
  },
  {
    title: "Building Resilience: Bouncing Back from Life's Challenges",
    content: "Resilience isn't something you're born with—it's built through experience. Key components: strong relationships, realistic optimism, self-compassion, and problem-solving skills. After setbacks, ask: What can I learn? What's still in my control? Practice self-care, maintain perspective, and remember past challenges you've overcome. You're stronger than you think.",
    category: "wellness"
  },
  {
    title: "The Importance of Professional Help: When to Seek Therapy",
    content: "You don't need to be in crisis to benefit from therapy. Seek help if: symptoms persist for more than two weeks, interfere with daily life, relationships suffer, or you're using substances to cope. Therapy isn't a sign of weakness—it's an investment in yourself. Many effective options exist: CBT, DBT, psychodynamic therapy. Finding the right therapist may take time, but it's worth it.",
    category: "mental-health"
  },
  {
    title: "Self-Compassion: Treat Yourself Like a Good Friend",
    content: "We're often our harshest critics. Self-compassion means treating yourself with the same kindness you'd offer a friend. When you make a mistake, instead of 'I'm so stupid,' try 'Everyone makes mistakes. What can I learn?' This isn't self-indulgence—research shows self-compassion reduces anxiety and depression while increasing motivation and resilience. You deserve your own kindness.",
    category: "self-care"
  },
  {
    title: "Creating a Mental Health Emergency Plan",
    content: "Prepare for difficult times when you're feeling well. Your plan should include: warning signs (e.g., isolating, sleep changes), coping strategies that work for you, emergency contacts (therapist, crisis hotline, trusted friends), and reasons to live. Keep this list accessible. Update it regularly. Having a plan reduces panic during crisis and reminds you that you've survived hard times before.",
    category: "mental-health"
  }
];

async function cleanAndAddQualityPosts() {
  try {
    console.log('🔍 Fetching all doctors...');
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('doctor_id, name, specialty');

    if (doctorError) {
      console.error('❌ Error fetching doctors:', doctorError);
      return;
    }

    if (!doctors || doctors.length === 0) {
      console.log('⚠️  No doctors found in database');
      return;
    }

    console.log(`✅ Found ${doctors.length} doctors`);

    // Get all posts to identify which ones to keep
    const { data: allPosts, error: postsError } = await supabase
      .from('doctor_posts')
      .select('post_id, title, created_at')
      .order('created_at', { ascending: true });

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return;
    }

    console.log(`\n📊 Current posts in database: ${allPosts.length}`);
    
    // Keep the first 6 posts (original ones before script)
    const postsToKeep = allPosts.slice(0, 6);
    const postsToDelete = allPosts.slice(6);

    console.log(`\n🗑️  Deleting ${postsToDelete.length} posts added by script...`);
    
    if (postsToDelete.length > 0) {
      const idsToDelete = postsToDelete.map(p => p.post_id);
      const { error: deleteError } = await supabase
        .from('doctor_posts')
        .delete()
        .in('post_id', idsToDelete);

      if (deleteError) {
        console.error('❌ Error deleting posts:', deleteError);
        return;
      }
      console.log(`✅ Deleted ${postsToDelete.length} duplicate posts`);
    }

    // Now add 20 quality posts distributed across doctors
    console.log('\n📝 Adding 20 high-quality mental health posts...');
    
    const postsToInsert = [];
    const postsPerDoctor = Math.floor(qualityPosts.length / doctors.length);
    const remainder = qualityPosts.length % doctors.length;

    let postIndex = 0;
    doctors.forEach((doctor, doctorIndex) => {
      // Distribute posts evenly, giving extra to first doctors if there's a remainder
      const numPostsForThisDoctor = postsPerDoctor + (doctorIndex < remainder ? 1 : 0);
      
      for (let i = 0; i < numPostsForThisDoctor && postIndex < qualityPosts.length; i++) {
        const post = qualityPosts[postIndex];
        postsToInsert.push({
          doctor_id: doctor.doctor_id,
          title: post.title,
          content: post.content,
          category: post.category,
          is_published: true
        });
        postIndex++;
      }
    });

    const { data: insertedPosts, error: insertError } = await supabase
      .from('doctor_posts')
      .insert(postsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting posts:', insertError);
      return;
    }

    console.log(`✅ Successfully added ${insertedPosts.length} quality posts!\n`);
    
    // Show distribution
    console.log('📊 Posts distribution by doctor:');
    const distribution = {};
    insertedPosts.forEach(post => {
      distribution[post.doctor_id] = (distribution[post.doctor_id] || 0) + 1;
    });
    
    doctors.forEach(doctor => {
      const count = distribution[doctor.doctor_id] || 0;
      console.log(`   ${doctor.name} (${doctor.specialty || 'General'}): ${count} posts`);
    });

    console.log('\n✨ Post categories:');
    const categories = {};
    insertedPosts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} posts`);
    });

    console.log('\n🎉 Database cleanup and quality posts addition complete!');
    console.log(`📈 Total posts now: ${6 + insertedPosts.length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

cleanAndAddQualityPosts();
