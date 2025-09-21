/**
 * Content Migration Script for howtomecm.com
 * Automates the migration from current site to new CMS
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const TARGET_DOMAIN = 'howtomecm.com'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface MigrationResult {
  success: boolean
  created: number
  failed: number
  errors: string[]
}

// Define the content structure from current site analysis
const SITE_CONTENT = {
  pages: [
    {
      title: 'Home',
      slug: 'home',
      status: 'published',
      sections: [
        {
          type: 'hero',
          content: {
            title: 'Microsoft Intune, SCCM & IAM Expert',
            subtitle: '13+ years of Microsoft-certified expertise in enterprise IT solutions',
            description: 'Transform your IT infrastructure with strategic consulting and training services.',
            ctaText: 'Contact Us Today',
            ctaUrl: '/contact'
          }
        },
        {
          type: 'services',
          content: {
            title: 'Our Core Services',
            subtitle: 'Comprehensive Microsoft technology solutions',
            services: [
              {
                name: 'Microsoft Intune',
                description: 'Mobile Device Management (MDM) and Mobile Application Management (MAM)',
                icon: 'device-mobile'
              },
              {
                name: 'SCCM',
                description: 'System Center Configuration Manager implementation and optimization',
                icon: 'server'
              },
              {
                name: 'Microsoft 365',
                description: 'Cloud productivity solutions and administration',
                icon: 'cloud'
              },
              {
                name: 'Azure AD / Entra ID',
                description: 'Identity and Access Management solutions',
                icon: 'shield'
              }
            ]
          }
        },
        {
          type: 'about',
          content: {
            title: 'Strategic IT Solutions',
            description: 'We provide expert consulting and training services for Microsoft enterprise technologies. Our certified trainers and consultants bring real-world experience to help organizations optimize their IT infrastructure.',
            credentials: [
              'Microsoft Certified Trainer (MCT)',
              '13+ years of experience',
              'Enterprise IT consulting',
              'Multi-language support'
            ]
          }
        },
        {
          type: 'cta',
          content: {
            title: 'Ready to Transform Your IT Infrastructure?',
            description: 'Get expert guidance on Microsoft technologies and take your organization to the next level.',
            ctaText: 'Start Your Project',
            ctaUrl: '/contact'
          }
        }
      ],
      seo: {
        metaTitle: 'How To MECM - Microsoft Intune, SCCM & IAM Expert Consulting',
        metaDescription: 'Expert Microsoft technology consulting with 13+ years experience. Specializing in Intune, SCCM, Microsoft 365, and Azure AD solutions.',
        focusKeyword: 'Microsoft SCCM consulting'
      }
    },
    {
      title: 'About Us',
      slug: 'about',
      status: 'published',
      sections: [
        {
          type: 'text',
          content: {
            title: 'About How To MECM',
            body: `
              <h2>Your Microsoft Technology Partner</h2>
              <p>How To MECM is a specialized consulting firm dedicated to helping organizations maximize their Microsoft technology investments. With over 13 years of hands-on experience, we provide expert guidance in device management, identity solutions, and cloud productivity.</p>

              <h3>Our Expertise</h3>
              <ul>
                <li><strong>Microsoft Certified Trainer (MCT)</strong> - Delivering official Microsoft training</li>
                <li><strong>Enterprise Consulting</strong> - Real-world implementation experience</li>
                <li><strong>Multi-language Support</strong> - Serving global organizations</li>
                <li><strong>Strategic Planning</strong> - Long-term IT roadmap development</li>
              </ul>

              <h3>Our Mission</h3>
              <p>To empower organizations with the knowledge and tools needed to successfully implement and manage Microsoft enterprise technologies, ensuring maximum ROI and operational efficiency.</p>
            `
          }
        }
      ],
      seo: {
        metaTitle: 'About How To MECM - Microsoft Technology Experts',
        metaDescription: 'Learn about our Microsoft technology consulting expertise, MCT credentials, and commitment to helping organizations succeed with enterprise IT solutions.',
        focusKeyword: 'Microsoft technology experts'
      }
    },
    {
      title: 'Contact',
      slug: 'contact',
      status: 'published',
      sections: [
        {
          type: 'text',
          content: {
            title: 'Ready to Discuss Your IT Challenges?',
            body: '<p>Contact us today to discuss how we can help transform your IT infrastructure with Microsoft technologies.</p>'
          }
        },
        {
          type: 'form',
          content: {
            formId: 'contact-form',
            title: 'Get Started Today',
            description: 'Tell us about your requirements and timeline'
          }
        }
      ],
      seo: {
        metaTitle: 'Contact How To MECM - Microsoft Technology Consulting',
        metaDescription: 'Contact our Microsoft technology experts for consulting on Intune, SCCM, Microsoft 365, and Azure AD implementations.',
        focusKeyword: 'Microsoft consulting contact'
      }
    }
  ],

  // Initial blog posts to establish content
  posts: [
    {
      title: 'Getting Started with Microsoft Intune: A Complete Guide',
      slug: 'getting-started-microsoft-intune-guide',
      excerpt: 'Learn the fundamentals of Microsoft Intune for mobile device management and application management in your organization.',
      content: `
        <h2>Introduction to Microsoft Intune</h2>
        <p>Microsoft Intune is a cloud-based service that focuses on mobile device management (MDM) and mobile application management (MAM). It helps organizations manage and secure devices and applications across different platforms.</p>

        <h3>Key Benefits</h3>
        <ul>
          <li>Centralized device management</li>
          <li>Application deployment and protection</li>
          <li>Security policy enforcement</li>
          <li>Cross-platform support</li>
        </ul>

        <h3>Getting Started Steps</h3>
        <ol>
          <li>Set up your Intune tenant</li>
          <li>Configure device enrollment</li>
          <li>Create compliance policies</li>
          <li>Deploy applications</li>
          <li>Monitor and report</li>
        </ol>

        <p>Ready to implement Intune in your organization? Contact us for expert guidance and implementation support.</p>
      `,
      category: 'Microsoft Intune',
      tags: ['Intune', 'MDM', 'MAM', 'Mobile Device Management'],
      status: 'published',
      seo: {
        metaTitle: 'Microsoft Intune Complete Guide - Getting Started Tutorial',
        metaDescription: 'Complete guide to getting started with Microsoft Intune for mobile device management. Learn setup, configuration, and best practices.',
        focusKeyword: 'Microsoft Intune guide'
      }
    },
    {
      title: 'SCCM vs Intune: Choosing the Right Management Solution',
      slug: 'sccm-vs-intune-choosing-management-solution',
      excerpt: 'Compare SCCM and Intune to determine the best device management solution for your organization\'s needs.',
      content: `
        <h2>SCCM vs Intune: Making the Right Choice</h2>
        <p>Organizations often face the decision between SCCM (System Center Configuration Manager) and Microsoft Intune for device management. Understanding the strengths of each solution is crucial for making the right choice.</p>

        <h3>When to Choose SCCM</h3>
        <ul>
          <li>On-premises infrastructure preference</li>
          <li>Complex software deployment needs</li>
          <li>Detailed reporting requirements</li>
          <li>Existing System Center investment</li>
        </ul>

        <h3>When to Choose Intune</h3>
        <ul>
          <li>Cloud-first strategy</li>
          <li>Mobile device focus</li>
          <li>Simplified management</li>
          <li>Remote workforce support</li>
        </ul>

        <h3>Hybrid Approach</h3>
        <p>Many organizations benefit from a co-management approach, using both SCCM and Intune together to leverage the strengths of each platform.</p>
      `,
      category: 'Device Management',
      tags: ['SCCM', 'Intune', 'Device Management', 'Comparison'],
      status: 'published',
      seo: {
        metaTitle: 'SCCM vs Intune Comparison - Choose the Right Management Solution',
        metaDescription: 'Compare SCCM and Microsoft Intune features to choose the best device management solution for your organization.',
        focusKeyword: 'SCCM vs Intune'
      }
    }
  ],

  // Form configuration for contact form
  forms: [
    {
      name: 'Contact Form',
      id: 'contact-form',
      fields: [
        {
          name: 'name',
          label: 'Your Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'your.email@company.com'
        },
        {
          name: 'services',
          label: 'Services of Interest',
          type: 'checkbox',
          required: false,
          options: [
            'MDM & MAM Implementation',
            'SCCM Implementation',
            'Consulting Services',
            'Patch Management',
            'Microsoft 365 Administration',
            'MCT Trainings',
            'Identity & Access Management',
            'Microsoft Teams implementation'
          ]
        },
        {
          name: 'timeline',
          label: 'Timeline for Implementation',
          type: 'select',
          required: false,
          options: [
            'Immediate (1-2 months)',
            'Short-term (3-6 months)',
            'Medium-term (6-12 months)',
            'Long-term (12+ months)',
            'Just exploring options'
          ]
        },
        {
          name: 'infrastructure',
          label: 'Existing Infrastructure Details',
          type: 'textarea',
          required: false,
          placeholder: 'Tell us about your current IT infrastructure, number of devices, etc.'
        },
        {
          name: 'questions',
          label: 'Additional Questions or Comments',
          type: 'textarea',
          required: false,
          placeholder: 'Any specific questions or requirements?'
        }
      ],
      settings: {
        successMessage: 'Thank you for your inquiry! We will get back to you within 24 hours.',
        redirectUrl: '/thank-you',
        notificationEmail: 'contact@howtomecm.com'
      }
    }
  ]
}

// Migration functions
export async function migratePages(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    created: 0,
    failed: 0,
    errors: []
  }

  for (const page of SITE_CONTENT.pages) {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          title: page.title,
          slug: page.slug,
          website_domain: TARGET_DOMAIN,
          status: page.status,
          sections: page.sections,
          seo: page.seo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        result.errors.push(`Failed to create page ${page.title}: ${error.message}`)
        result.failed++
      } else {
        result.created++
        console.log(`✅ Created page: ${page.title}`)
      }
    } catch (error) {
      result.errors.push(`Error creating page ${page.title}: ${error}`)
      result.failed++
    }
  }

  result.success = result.failed === 0
  return result
}

export async function migratePosts(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    created: 0,
    failed: 0,
    errors: []
  }

  for (const post of SITE_CONTENT.posts) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: post.title,
          slug: post.slug,
          website_domain: TARGET_DOMAIN,
          excerpt: post.excerpt,
          content: post.content,
          status: post.status,
          category: post.category,
          tags: post.tags,
          seo: post.seo,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        result.errors.push(`Failed to create post ${post.title}: ${error.message}`)
        result.failed++
      } else {
        result.created++
        console.log(`✅ Created post: ${post.title}`)
      }
    } catch (error) {
      result.errors.push(`Error creating post ${post.title}: ${error}`)
      result.failed++
    }
  }

  result.success = result.failed === 0
  return result
}

export async function runFullMigration(): Promise<void> {
  console.log('🚀 Starting content migration for howtomecm.com...')

  console.log('\n📄 Migrating pages...')
  const pageResult = await migratePages()
  console.log(`Pages: ${pageResult.created} created, ${pageResult.failed} failed`)

  console.log('\n📰 Migrating blog posts...')
  const postResult = await migratePosts()
  console.log(`Posts: ${postResult.created} created, ${postResult.failed} failed`)

  const totalCreated = pageResult.created + postResult.created
  const totalFailed = pageResult.failed + postResult.failed
  const allErrors = [...pageResult.errors, ...postResult.errors]

  console.log('\n📊 Migration Summary:')
  console.log(`✅ Total created: ${totalCreated}`)
  console.log(`❌ Total failed: ${totalFailed}`)

  if (allErrors.length > 0) {
    console.log('\n❌ Errors encountered:')
    allErrors.forEach(error => console.log(`  - ${error}`))
  }

  if (totalFailed === 0) {
    console.log('\n🎉 Migration completed successfully!')
  } else {
    console.log('\n⚠️ Migration completed with errors. Please review and retry failed items.')
  }
}

// Export for manual execution
export { SITE_CONTENT }

// CLI execution
if (require.main === module) {
  runFullMigration().catch(console.error)
}