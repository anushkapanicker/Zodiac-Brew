import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import founderData from '../data/founderData';

const Founders = () => {
  return (
    <div className="min-h-screen pt-16 bg-amber-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <Users size={36} className="text-amber-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">Our Founders</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the visionary team behind Zodiac Brew who combined their passion for coffee and astrology.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {founderData.map((founder, index) => (
            <motion.div
              key={founder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={founder.image} 
                  alt={founder.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-amber-900">{founder.name}</h3>
                <p className="text-gray-600">{founder.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Founders;