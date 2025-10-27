import Link from "next/link";
// import Image from "next/image";
export default async function HomePage({ params }) {
    return (
      <>
        <main className="bg-gray-50 min-h-screen">
          <div
            className="hero min-h-screen relative"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFwZXIlMjBkb2N1bWVudCUyMGhlcm98ZW58MHx8MHx8fDA%3D)",
            }}
          >
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="container mx-auto px-6 lg:px-12 py-16 flex flex-col md:flex-row items-center">
              {/* Text Content */}
                <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                  <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
                    {"Welcome to Our Website."}
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-300">
                    {"Explore our services and make your life easier."}
                  </p>
                  <div className="flex justify-center md:justify-start space-x-4">
                    <Link href="/user">
                      <button className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition">
                        {"User Login"}
                      </button>
                    </Link>
                    <Link href="/about">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition">
                        {"Learn More"}
                      </button>
                    </Link>
                    <Link href="/services">
                      <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-300 transition">
                        {"Get Started"}
                      </button>
                    </Link>
                  </div>
                </div>
                {/* Image */}
                <div className="w-full md:w-1/2 mt-10 md:mt-0">
                  <img
                    src="/hero.jpg" // Replace with your image path
                    alt="Hero Section"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg"
                    // priority
                  />
                </div>
            </div>
          </div>

 {/* Cards Section */}
 <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800">Explore Features</h2>
              <p className="text-blue-800 mt-2">Property Registration:</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">👉</span>
                  <Link href="/property-apply" className="text-blue-600 hover:underline">
                    Apply
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">👉</span>
                  <Link href="/settings" className="text-blue-600 hover:underline">
                    Customize Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="card bg-white shadow-lg rounded-lg p-6">
              <div className="carousel w-full mb-4">
                <div id="slide1" className="carousel-item relative w-full">
                  <img
                    src="/doc.jpg"
                    alt="Carousel Image 1"
                    width={400}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Our Services</h2>
              <p className="text-gray-600 mt-2">Check out what we offer:</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">📦</span>
                  <Link href="/services" className="text-blue-600 hover:underline">
                    View All Services
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">🛠️</span>
                  <Link href="/support" className="text-blue-600 hover:underline">
                    Support Options
                  </Link>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="card bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800">Resources</h2>
              <p className="text-gray-600 mt-2">Find useful information here:</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">📚</span>
                  <Link href="/docs" className="text-blue-600 hover:underline">
                    Documentation
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">💡</span>
                  <Link href="/blog" className="text-blue-600 hover:underline">
                    Blog Articles
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

          {/* Features Section */}
          <section className="bg-gray-200 py-16">
            <div className="container mx-auto px-6 lg:px-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                Why Choose Us?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {[
                  {
                    icon: "🚀",
                    title: "Fast & Reliable",
                    desc: "Get results quickly and reliably.",
                  },
                  {
                    icon: "🔒",
                    title: "Secure",
                    desc: "Your data is safe with us.",
                  },
                  {
                    icon: "⭐",
                    title: "Trusted by Thousands",
                    desc: "Join a growing community of happy users.",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow"
                  >
                    <div className="text-5xl">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mt-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 lg:px-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                Our Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {[
                  {
                    title: "Service 1",
                    desc: "Description of service 1.",
                    icon: "💼",
                  },
                  {
                    title: "Service 2",
                    desc: "Description of service 2.",
                    icon: "📈",
                  },
                  {
                    title: "Service 3",
                    desc: "Description of service 3.",
                    icon: "🎯",
                  },
                ].map((service, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow">
                    <div className="text-5xl text-blue-600">{service.icon}</div>
                    <h3 className="text-xl font-semibold mt-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6 lg:px-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                What Our Customers Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {[
                  {
                    name: "John Doe",
                    feedback: "Amazing experience!",
                    avatar: "/avatar1.jpg",
                  },
                  {
                    name: "Jane Smith",
                    feedback: "Excellent service!",
                    avatar: "/avatar2.jpg",
                  },
                  {
                    name: "Sam Wilson",
                    feedback: "Highly recommend!",
                    avatar: "/avatar3.jpg",
                  },
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-6 rounded-lg shadow"
                  >
                    <img
                      src="/hero.jpg"
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="rounded-full mx-auto"
                    />
                    <p className="mt-4 text-gray-600">{testimonial.feedback}</p>
                    <p className="mt-2 font-bold text-gray-800">
                      {testimonial.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Blog or News Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6 lg:px-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                Latest Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {[
                  {
                    title: "How to Get Started",
                    link: "/blog/how-to-get-started",
                  },
                  {
                    title: "Top 10 Tips for Success",
                    link: "/blog/top-10-tips",
                  },
                  { title: "Why Choose Us?", link: "/blog/why-choose-us" },
                ].map((article, index) => (
                  <Link
                    key={index}
                    href={article.link}
                    className="block bg-gray-100 p-6 rounded-lg shadow hover:bg-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {article.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Call-to-Action Section */}
          {/* <section className="bg-blue-500 py-12">
          <div className="container mx-auto text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4">Join us today and experience the difference!</p>
            <Link href="/signup">
              <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100">
                Sign Up Now
              </button>
            </Link>
          </div>
        </section> */}
        </main>
      </>
    );
}
