require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('./config/supabase');

async function populateInitialData() {
  try {
    console.log('🚀 Populating initial portfolio data...');
    
    // 1. Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabaseAdmin.from('about_me').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('gears').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('certificates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('work_experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 2. Create admin user
    console.log('👤 Creating admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'admin@portfolio.com',
        password_hash: passwordHash,
        name: 'Admin User',
        role: 'admin',
        is_active: true
      })
      .select('*')
      .single();
    
    if (userError) {
      console.error('❌ Error creating user:', userError);
      return;
    }
    console.log('✅ Admin user created:', user.email);
    
    // 3. Insert sample projects
    console.log('📁 Creating sample projects...');
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          title: 'E-Commerce Platform',
          description: 'A full-stack e-commerce platform built with React, Node.js, and PostgreSQL. Features include user authentication, product catalog, shopping cart, and payment processing.',
          image_url: 'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=E-Commerce',
          live_url: 'https://example.com',
          github_url: 'https://github.com/username/ecommerce',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
          featured: true
        },
        {
          title: 'Task Management App',
          description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
          image_url: 'https://via.placeholder.com/600x400/10B981/FFFFFF?text=Task+App',
          live_url: 'https://example.com',
          github_url: 'https://github.com/username/taskapp',
          technologies: ['Vue.js', 'Socket.io', 'MongoDB'],
          featured: true
        },
        {
          title: 'Weather Dashboard',
          description: 'A responsive weather dashboard that displays current conditions and forecasts using data from multiple weather APIs.',
          image_url: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Weather',
          live_url: 'https://example.com',
          github_url: 'https://github.com/username/weather',
          technologies: ['JavaScript', 'CSS3', 'Weather API'],
          featured: false
        }
      ])
      .select('*');
    
    if (projectsError) {
      console.error('❌ Error creating projects:', projectsError);
    } else {
      console.log('✅ Projects created:', projects.length);
    }
    
    // 4. Insert work experience
    console.log('💼 Creating work experience...');
    const { data: work, error: workError } = await supabaseAdmin
      .from('work_experience')
      .insert([
        {
          company: 'Tech Solutions Inc.',
          position: 'Senior Full Stack Developer',
          start_date: '2022-01-01',
          end_date: null,
          description: 'Led development of microservices architecture and mentored junior developers. Improved system performance by 40% and reduced deployment time by 60%.',
          technologies: ['React', 'Node.js', 'Docker', 'AWS']
        },
        {
          company: 'Digital Agency',
          position: 'Frontend Developer',
          start_date: '2020-06-01',
          end_date: '2021-12-31',
          description: 'Developed responsive web applications for various clients. Collaborated with design team to implement pixel-perfect UIs and optimized for performance.',
          technologies: ['React', 'TypeScript', 'SASS', 'Webpack']
        },
        {
          company: 'StartupXYZ',
          position: 'Junior Developer',
          start_date: '2019-01-01',
          end_date: '2020-05-31',
          description: 'Built and maintained web applications using modern JavaScript frameworks. Participated in code reviews and agile development processes.',
          technologies: ['JavaScript', 'Vue.js', 'Express.js', 'MySQL']
        }
      ])
      .select('*');
    
    if (workError) {
      console.error('❌ Error creating work experience:', workError);
    } else {
      console.log('✅ Work experience created:', work.length);
    }
    
    // 5. Insert certificates
    console.log('🏆 Creating certificates...');
    const { data: certificates, error: certError } = await supabaseAdmin
      .from('certificates')
      .insert([
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          issue_date: '2023-06-15',
          credential_id: 'AWS-SAA-123456',
          credential_url: 'https://aws.amazon.com/verification',
          image_url: 'https://via.placeholder.com/300x200/FF9900/FFFFFF?text=AWS'
        },
        {
          name: 'React Developer Certification',
          issuer: 'Meta',
          issue_date: '2023-03-20',
          credential_id: 'META-REACT-789012',
          credential_url: 'https://meta.com/certificates',
          image_url: 'https://via.placeholder.com/300x200/61DAFB/FFFFFF?text=React'
        },
        {
          name: 'Google Cloud Professional',
          issuer: 'Google Cloud',
          issue_date: '2023-01-10',
          credential_id: 'GCP-PRO-345678',
          credential_url: 'https://cloud.google.com/certification',
          image_url: 'https://via.placeholder.com/300x200/4285F4/FFFFFF?text=GCP'
        }
      ])
      .select('*');
    
    if (certError) {
      console.error('❌ Error creating certificates:', certError);
    } else {
      console.log('✅ Certificates created:', certificates.length);
    }
    
    // 6. Insert gears
    console.log('⚙️ Creating gears...');
    const { data: gears, error: gearsError } = await supabaseAdmin
      .from('gears')
      .insert([
        {
          category: 'devices',
          name: 'MacBook Pro 16"',
          description: 'M1 Max chip, 32GB RAM, 1TB SSD',
          image_url: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=MacBook',
          purchase_url: 'https://apple.com/macbook-pro'
        },
        {
          category: 'devices',
          name: 'Dell XPS 13',
          description: 'Intel i7, 16GB RAM, 512GB SSD',
          image_url: 'https://via.placeholder.com/200x200/007DB8/FFFFFF?text=Dell',
          purchase_url: 'https://dell.com/xps'
        },
        {
          category: 'extensions',
          name: 'VS Code',
          description: 'Visual Studio Code with essential extensions',
          image_url: 'https://via.placeholder.com/200x200/007ACC/FFFFFF?text=VS+Code',
          purchase_url: 'https://code.visualstudio.com'
        },
        {
          category: 'extensions',
          name: 'GitHub Copilot',
          description: 'AI-powered code completion',
          image_url: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=Copilot',
          purchase_url: 'https://github.com/features/copilot'
        }
      ])
      .select('*');
    
    if (gearsError) {
      console.error('❌ Error creating gears:', gearsError);
    } else {
      console.log('✅ Gears created:', gears.length);
    }
    
    // 7. Insert about me
    console.log('👤 Creating about me...');
    const { data: aboutMe, error: aboutError } = await supabaseAdmin
      .from('about_me')
      .insert({
        title: 'Full Stack Developer',
        subtitle: 'Passionate about creating amazing web experiences',
        description: 'I am a passionate full-stack developer with 5+ years of experience building scalable web applications. I love working with modern technologies and creating solutions that make a difference.',
        image_url: 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Profile',
        resume_url: 'https://example.com/resume.pdf'
      })
      .select('*')
      .single();
    
    if (aboutError) {
      console.error('❌ Error creating about me:', aboutError);
    } else {
      console.log('✅ About me created');
    }
    
    console.log('\n🎉 Initial data population complete!');
    console.log('Login credentials:');
    console.log('Email: admin@portfolio.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error in populateInitialData:', error);
  }
}

populateInitialData();
