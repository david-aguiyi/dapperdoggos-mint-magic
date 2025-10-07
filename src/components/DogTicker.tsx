import dapper1 from "@/assets/dapper-1.jpg";
import dapper2 from "@/assets/dapper-2.jpg";
import dapper3 from "@/assets/dapper-3.webp";
import dapper4 from "@/assets/dapper-4.jpg";
import dapper5 from "@/assets/dapper-5.jpg";

const dogs = [dapper1, dapper2, dapper3, dapper4, dapper5];

export const DogTicker = () => {
  // Duplicate the array to create seamless loop
  const allDogs = [...dogs, ...dogs, ...dogs];

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="flex gap-6 animate-[scroll_30s_linear_infinite]">
        {allDogs.map((dog, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-4 border-foreground/10 hover:scale-110 transition-transform duration-300"
          >
            <img
              src={dog}
              alt={`DapperDoggo ${(index % dogs.length) + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};