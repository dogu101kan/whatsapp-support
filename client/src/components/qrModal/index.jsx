import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import QRCode from "qrcode.react";
import { useState } from "react";



const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh', // Sayfaya sığacak şekilde maksimum yükseklik ayarlayın
    textAlign: 'center',
    maxWidth: '80vw',
  };



const QRModal = ({ qr }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
      setOpen(true);
    };
    
    const handleClose = () => {
      setOpen(false);
    };
  
    return (
      <div className="inline-flex">
        <Button onClick={handleOpen}>
            <p className='text-red-900'>Qr Okutunuz</p>
        </Button>
        
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '100%' }}>
            <div style={{ overflow: 'hidden', maxHeight: '100%' }}>
                <QRCode value={qr} size={256} />
            </div>
          </Box>
        </Modal>
      </div>
    );
}

export default QRModal