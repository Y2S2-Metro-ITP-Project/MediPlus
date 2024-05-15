import React from 'react'

export default function Home() {
  const [doctors, setDoctors] = useState([]);


  useEffect(() => {
    
    async function fetchDoctors() {
      try {
        const response = await fetch(`/api/employee/getDoctorDetails`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const doctorsData = await response.json();
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    }
    fetchDoctors();
  }, []);

  


  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
            <img
              alt=""
              src="https://www.health365.sg/wp-content/uploads/2022/11/Quick-Guide-to-Hospitals-in-Singapore.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="lg:py-24">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ismail's Pvt Hospital
            </h2>

            <p className="mt-4 text-gray-600">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aut qui
              hic atque tenetur quis eius quos ea neque sunt, accusantium soluta
              minus veniam tempora deserunt? Molestiae eius quidem quam
              repellat.
            </p>

            <a
              href="#"
              className="mt-8 inline-block rounded bg-indigo-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-yellow-400"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </div>
      <section>
        <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:h-screen lg:grid-cols-2">
            <div className="relative z-10 lg:py-16">
              <div className="relative h-64 sm:h-80 lg:h-full">
                <img
                  alt=""
                  src="https://i0.wp.com/calmatters.org/wp-content/uploads/2022/06/033023-Hollister-Hospital-LV_10-CM.jpg?fit=2000%2C1333&ssl=1"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="relative flex items-center bg-gray-100">
              <span className="hidden lg:absolute lg:inset-y-0 lg:-start-16 lg:block lg:w-16 lg:bg-gray-100"></span>

              <div className="p-8 sm:p-16 lg:p-24">
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Tempore, debitis.
                </h2>

                <p className="mt-4 text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Aliquid, molestiae! Quidem est esse numquam odio deleniti,
                  beatae, magni dolores provident quaerat totam eos, aperiam
                  architecto eius quis quibusdam fugiat dicta.
                </p>

                <a
                  href="#"
                  className="mt-8 inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/** Lab Services section */}
      {/* Doctor section*/}
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <header className="text-center">
            <h2 className="mx-auto text-xl font-bold text-gray-900 sm:text-3xl">
            Meet Our Dedicated Doctors
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500">
            Our team of skilled and compassionate doctors is committed to providing exceptional care to every patient. With a wealth of experience and expertise, 
            they ensure personalized attention and the highest quality treatment. trust our doctors to support your health journey.
            </p>
          </header>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Map through your 'doctors' array and render doctor cards */}
            {doctors.map((doctor) => (
              <li key={doctor.userId}>
                <a href="#" className="group block overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="h-[350px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[450px]"
                  />
                  <div className="relative bg-white pt-3">
                    <h3 className="text-xs text-gray-700 group-hover:underline group-hover:underline-offset-4">
                      {doctor.name}
                    </h3>
                    <p className="mt-2">
                      <span className="sr-only"> Specialization </span>
                      <span className="tracking-wider text-gray-900">
                        {doctor.specialization}
                      </span>
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}
