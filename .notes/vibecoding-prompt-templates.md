Müşteri Verilerine Güvenme: Form/URL girişini doğrudan kullanma.
Düzeltme: Her zaman sunucuda doğrulama ve temizleme yapın; çıktıyı kaçış karakterleriyle işleyin.

Frontend'deki Sırlar: React/Next.js istemci kodundaki API anahtarları/kimlik bilgileri.
Düzeltme: Gizli bilgileri yalnızca sunucu tarafında tutun (ortam değişkenleri, .env dosyasının .gitignore dosyasında olduğundan emin olun).

Zayıf Yetkilendirme: Sadece oturum açılıp açılmadığını kontrol eder, bir şey yapmaya/görmeye izin verilip verilmediğini kontrol etmez.
Düzeltme: Sunucu, her işlem ve kaynak için izinleri doğrulamalıdır .

Sızıntılı Hatalar: Kullanıcılara ayrıntılı yığın izleri/veritabanı hataları gösteriliyor.
Düzeltme: Kullanıcılar için genel hata mesajları; geliştiriciler için ayrıntılı günlükler.

Sahiplik Kontrolü Yok (IDOR): Kullanıcı X'in, öngörülebilir kimlikler aracılığıyla kullanıcı Y'nin verilerine erişmesine/düzenlemesine izin verme.
Düzeltme: Sunucu, mevcut kullanıcının belirli kaynak kimliğine sahip olduğunu/erişim sağlayabildiğini doğrulamalıdır.

Veritabanı Düzeyinde Güvenliği Göz Ardı Etme: Ayrıntılı erişim için RLS gibi veritabanı özelliklerini atlamak.
Çözüm: Veri erişim kurallarını doğrudan veritabanınızda tanımlayın (örneğin, RLS).

Korunmasız API'ler ve Hassas Veriler: Eksik hız sınırlamaları; hassas veriler şifrelenmemiş.
Çözüm: API'lere (ara yazılım) hız sınırlaması uygulayın; hassas verileri depolama sırasında şifreleyin; her zaman HTTPS kullanın.

What could go wrong with this code? What edge cases should I handle?

What security best practices should I follow with this code? How should I handle authentication and sensitive data?

Why did you choose this approach over alternatives? What are the trade-offs?

If I deploy this code to production with Supabase, what potential problems should I watch for?

Review this code as if it's going live tomorrow. Identify security concerns, performance bottlenecks, and missing error handling. Suggest specific improvements.

## UI component template#

Technical context:

- Framework: [React/Vue/Angular/etc.]
- Styling: [Tailwind/CSS modules/styled-components]
- State management: [useState/Zustand/Redux]
- Icon library: [Lucide/Heroicons/etc.]

Component specification:

- Purpose: [What this component does]
- Props interface: [Expected props with types]
- User interactions: [Clicks, hovers, keyboard events]
- Visual states: [Loading, error, empty, success states]
- Accessibility: [ARIA labels, keyboard navigation]

Integration considerations:

- Parent integration: [How it fits in the app]
- Performance: [Memoization, lazy loading needs]
- Error boundaries: [Failure handling]
- Mobile responsiveness: [Breakpoint considerations]
- Testing: [Key behaviors to verify]

Create a [component name] component that [specific functionality].

## API endpoint template#

Technical context:

- Framework: [Express/Next.js API routes/FastAPI/etc.]
- Authentication: [JWT/session-based/API keys]
- Data layer: [Database ORM, external APIs]
- Response format: [JSON structure preferences]

Endpoint specification:

- Method and route: [GET/POST/etc.] /api/[path]
- Purpose: [What this endpoint accomplishes]
- Request format: [Body structure, query params, headers]
- Response format: [Success and error responses]
- Business logic: [Key operations and validations]

Integration and edge cases:

- Authentication: [Access control, permission levels]
- Validation: [Input sanitization, required fields]
- Error handling: [Specific error scenarios and responses]
- Rate limiting: [Protection against abuse]
- External dependencies: [Third-party APIs, database queries]

Create an API endpoint that [specific functionality].

## Data modeling template#

Technical context:

- Database: [Supabase/PostgreSQL/etc.]
- Language/Framework: [TypeScript/Python/etc.]
- Constraints: [Naming conventions, relationship patterns]

Data requirements:

- Entity: [Name and purpose]
- Core fields: [Essential fields with types]
- Relationships: [Connections to other entities]
- Business rules: [Validation requirements, constraints]

Integration considerations:

- Data validation: [Required fields, format requirements]
- Performance: [Indexing needs, query patterns]
- Security: [Access control, sensitive data handling]
- Migration: [How this fits with existing schema]

Create a data model for [specific use case].

## Here's an example three-layer prompt for a todo item component:

Create a TodoItem component with the following specifications:

Technical context:

- React component using TypeScript
- Styled with Tailwind CSS using our design system
- Uses Lucide React icons for UI elements
- Follows existing component patterns with proper props interface

Functional requirements:

- Display todo text with completion checkbox
- Show edit button that toggles inline editing mode
- Include delete button with confirmation dialog
- Visual distinction between completed and pending todos
- Smooth transitions between view and edit modes

Integration and edge cases:

- Integrates with Supabase for state management
- Handle empty or whitespace-only todo text gracefully
- Optimistic UI updates during API calls
- Keyboard shortcuts: Enter to save, Escape to cancel
- Loading states for delete and update operations
- Prevent double-clicks on action buttons

## Security audit prompt:

Conduct a comprehensive security audit of my application and implement these measures:

Authentication & Access Control:

- Ensure secure password storage with proper hashing
- Add session timeouts and proper logout functionality
- Implement user role restrictions and data isolation
- Use Supabase Auth for authentication handling

Data Protection:

- Enable Row Level Security (RLS) policies for user data (especially for Supabase)
- Review all form inputs for proper validation and sanitization
- Add rate limiting to prevent spam attacks

Application Security:

- Implement error handling that doesn't reveal sensitive information
- Hide database connection details from users
- Scan for API keys in frontend components and move to environment variables

Provide a summary of specific changes made to improve security.

## Database optimization prompt:

Review my database schema and ensure it includes:

Structure & Relationships:

- Proper table relationships with primary/foreign keys
- Normalized structure avoiding data duplication
- Junction tables for many-to-many relationships

Data Integrity:

- Unique constraints on emails, usernames, phone numbers
- NOT NULL requirements where appropriate
- Proper data types and validation rules

Performance & Maintenance:

- Indexes on frequently queried columns
- Migration planning for future schema changes
- Backup and recovery configuration

Explain the architectural decisions and suggest improvements.

## Performance optimization prompt:

My application needs performance optimization. Here's my PageSpeed data:

[Include your specific PageSpeed results here]

Implement optimizations in this order:

1. Image Optimization
   - Compress large images (target ≤100KB where possible)
   - Implement lazy loading for off-screen images
   - Use modern formats like WebP where supported

2. Code Optimization
   - Remove unused JavaScript and CSS
   - Minify remaining files
   - Split large bundles into smaller chunks

3. Loading Improvements
   - Add loading states for async operations
   - Implement pagination for large data sets
   - Reduce layout shifts with proper sizing

For each optimization:

1. Identify the specific issue in my code
2. Show the updated implementation
3. Explain the performance benefit
4. Estimate the PageSpeed improvement

Work through these systematically, confirming each stage before proceeding.

## Deployment preparation prompt:

Prepare my application for production deployment:

Current Setup:

- Built with [your AI tool]
- Using Supabase for backend/database
- Deploying to [Vercel/Netlify/other]
- Custom domain: [yourdomain.com]

Implementation Steps:

1. Environment Configuration
   - Move hard-coded config to environment variables
   - Set up production vs. development environments
   - Configure deployment platform settings

2. Error Handling & UX
   - Add error boundaries for component crashes
   - Create user-friendly error pages (404, 500, network errors)
   - Implement loading states for all async operations

3. Production Optimization
   - Optimize images and assets
   - Remove development code and console.logs
   - Add proper meta tags for SEO
   - Ensure responsive design works on all devices

4. Monitoring & Deployment
   - Set up error tracking and basic analytics
   - Configure automatic deployment from GitHub
   - Test custom domain and SSL setup

For each step, provide:

1. Exact code changes needed
2. Platform configuration settings
3. Simple test to verify functionality
4. Troubleshooting guidance

Conclude with a final production checklist.
