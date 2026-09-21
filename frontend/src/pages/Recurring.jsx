import React, {useEffect, useState, useCallback} from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';


function Recurring() {
  const [recurrings, setRecurrings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecurrings = async () => {
    try{
      const response = await api.get('/api/finance/recurring');
      setRecurrings(response.data || []);
    }catch(error){
      console.error("Failed to load recurrings: ", error);
      toast.error("Failed to load recurrings.");
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecurrings();
  }, []);

  return (
    <div>
      <h2>Recurring Transactions</h2>
      <p>Configure recurring automatic income or expense bills here.</p>
    </div>
  );
}

export default Recurring;
