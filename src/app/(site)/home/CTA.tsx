"use client";
export default function CTA (){
    return (
           <section className="w-full  pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex items-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
             Creativity Made <br/> Simple.
            </h2>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-600 text-lg leading-relaxed">
             Harness the power of artificial intelligence to create innovative solutions, automate complex tasks, and unlock new possibilities. Our AI-powered tools help businesses and creators work smarter, faster, and more efficiently.
            </p>
          </div>
        </div>
        <div className="w-full">
          <div className="relative w-full h-50 sm:h-60 lg:h-60 rounded-3xl overflow-hidden">
            <img
              src="https://res.cloudinary.com/dggey8rb6/image/upload/v1781091802/9e8b4afff68ab2f3cd53d9f7de517fc7_jhlqpw.jpg" 
              alt="Fashion collection showing different colored shirts"
              className="w-full h-full object-cover object"
            />
          </div>
        </div>
      </div>
    </section>
    )
}
