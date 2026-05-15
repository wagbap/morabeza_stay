import { useState } from 'react';
import { useBooking } from '../../../context/BookingContext'; // Importa o contexto que criámos

export const useReserva = (alojamentoId, precoNoite) => {
  const { updateBooking } = useBooking(); // Pega a função de salvar do contexto
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [numHospedes, setNumHospedes] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      setTimeout(() => setShowCalendar(false), 300);
      
      // CÁLCULO PROFISSIONAL: Salva no contexto assim que escolhe as datas
      const dias = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      updateBooking({
        checkIn: start,
        checkOut: end,
        hospedes: numHospedes,
        alojamentoId: alojamentoId,
        precoTotal: dias * precoNoite
      });
    }
  };

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  return {
    startDate,
    endDate,
    numHospedes,
    setNumHospedes,
    showCalendar,
    toggleCalendar,
    handleDateChange,
    setShowCalendar
  };
};