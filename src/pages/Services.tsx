import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ZodiacSelector from '../components/ZodiacSelector';
import CoffeeCard from '../components/CoffeeCard';

interface Coffee {
  _id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  zodiacSigns: string[];
}

const Services = () => {
  const [selectedZodiacSign, setSelectedZodiacSign] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Coffee[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [coffeeData, setCoffeeData] = useState<Coffee[]>([]);

  useEffect(() => {
    // Fetch coffee data from the API
    const fetchCoffeeData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/coffees');
        if (!response.ok) {
          throw new Error('Failed to fetch coffee data');
        }
        const res = await response.json();
        const { data } = res;
        // Ensure the response is an array
        setCoffeeData(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error('Error fetching coffee data:', error);
        setCoffeeData([]); // Fallback to an empty array on error
      }
    };

    fetchCoffeeData();

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    if (selectedZodiacSign) {
      const filtered = coffeeData.filter(coffee =>
        coffee.zodiacSigns.includes(selectedZodiacSign)
      );

      // If no matches found, provide some default recommendations
      setRecommendations(filtered.length > 0 ? filtered : coffeeData.slice(0, 3));
    } else {
      setRecommendations([]);
    }
  }, [selectedZodiacSign, coffeeData]);

  const handleSelectZodiacSign = (sign: string) => {
    setSelectedZodiacSign(sign);
  };

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];

    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen pt-16 bg-amber-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">Coffee Recommendation Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Let us find your perfect coffee match based on your zodiac sign.
          </p>
        </div>

        <div className="gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ZodiacSelector 
              selectedSign={selectedZodiacSign} 
              onSelectSign={handleSelectZodiacSign} 
            />
          </motion.div>
        </div>

        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Your Personalized Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map(coffee => (
                <CoffeeCard
                  key={coffee._id}
                  id={coffee._id}
                  name={coffee.name}
                  description={coffee.description}
                  image={coffee.image}
                  price={coffee.price}
                  zodiacSign={coffee.zodiacSigns[0]}
                  isFavorite={favorites.includes(coffee._id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </motion.div>
        )}

        {!selectedZodiacSign && (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">
              Please select your zodiac sign to get personalized coffee recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;