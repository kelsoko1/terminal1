// Simple script to test AI post generation
const fetch = require('node-fetch');

async function generateAIPost() {
  try {
    console.log('Generating AI post...');
    
    const response = await fetch('http://localhost:3000/api/social/ai-generate-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ AI Post generated successfully!');
      console.log('📝 Content:', data.post);
      console.log('🆔 Post ID:', data.createdPost?.id);
    } else {
      console.log('❌ Failed to generate AI post:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the function
generateAIPost(); 