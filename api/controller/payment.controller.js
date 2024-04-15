import Payment from '../models/payment.model.js';
import Bed from '../models/bed.model.js';


export const fetchpayment = async (req, res, next) => 
{
    try {
      const bedNumber = req.params.bedNumber;
      const bed = await Bed.findOne({ number: bedNumber }).populate('patient');
  
      if (!bed || !bed.patient) {
        return res.status(404).json({ message: 'Bed or patient not found' });
      }
  
      const payment = await Payment.findOne({ patientId: bed.patient._id });
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
  
      res.json({ status: payment.status });
    } catch (error) {
      console.error('Error fetching payment status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };