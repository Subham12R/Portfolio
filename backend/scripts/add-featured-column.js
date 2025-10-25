require('dotenv').config();
const { supabase } = require('../config/supabase');

async function addFeaturedColumn() {
  try {
    console.log('🔧 Adding featured column to projects and work_experience tables...\n');

    // Add featured column to projects table
    console.log('1️⃣ Adding featured column to projects table...');
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
    } else {
      console.log(`✅ Found ${projectsData.length} projects`);
      
      // Update all projects to be featured
      for (const project of projectsData) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ featured: true })
          .eq('id', project.id);
        
        if (updateError) {
          console.error(`❌ Error updating project ${project.name}:`, updateError);
        } else {
          console.log(`✅ Updated project: ${project.name}`);
        }
      }
    }

    // Add featured column to work_experience table
    console.log('\n2️⃣ Adding featured column to work_experience table...');
    const { data: workData, error: workError } = await supabase
      .from('work_experience')
      .select('*');

    if (workError) {
      console.error('❌ Error fetching work experience:', workError);
    } else {
      console.log(`✅ Found ${workData.length} work experience records`);
      
      // Update all work experience to be featured
      for (const work of workData) {
        const { error: updateError } = await supabase
          .from('work_experience')
          .update({ featured: true })
          .eq('id', work.id);
        
        if (updateError) {
          console.error(`❌ Error updating work experience ${work.company}:`, updateError);
        } else {
          console.log(`✅ Updated work experience: ${work.company}`);
        }
      }
    }

    console.log('\n🎉 Featured column update completed!');
    console.log('\n📊 Summary:');
    console.log(`- Projects updated: ${projectsData?.length || 0}`);
    console.log(`- Work Experience updated: ${workData?.length || 0}`);

  } catch (error) {
    console.error('❌ Error adding featured column:', error);
  }
}

// Run the script
addFeaturedColumn();
