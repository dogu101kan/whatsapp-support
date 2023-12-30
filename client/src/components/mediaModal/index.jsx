import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from "react";
import { downloadFile } from "../../utils/mediaDownloader";



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



const MediaModal = ({ message }) => {
    const [open, setOpen] = useState(false);
    const [audio, setAudio] = useState();

    const handleOpen = () => {
      setOpen(true);
    };
    
    const handleClose = () => {
      setOpen(false);
    };



useEffect(()=>{
  if(message.file?.mediaType !== null && message.file?.mediaType.split("/")[0] ==="audio"){
    message.file?.mediaType.split("/")[0] ==="audio"
    const base64String = message.file.media;
    const bytes = atob(base64String);
    const byteArray = new Uint8Array(bytes.length);

    for (let i = 0; i < bytes.length; i++) {
      byteArray[i] = bytes.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: message.file?.mediaType });
    setAudio(URL.createObjectURL(blob));
  }
},[])

const handleDownload = (base64Data, fileName, fileType) => {
  downloadFile(base64Data, fileName, fileType);
};

    return (
      <div className="inline-flex">
        <Button onClick={handleOpen}>
            {message.file?.mediaType && message.file?.mediaType.split("/")[0] ==="image" && <img className="w-24" src={`data:${message.file?.mediaType};base64,${message.file?.media}`} />}
            {audio &&
              <audio controls>
                <source src={audio} type={message.file?.mediaType} />
              </audio>
            }
            {message.file?.mediaType && message.file?.mediaType.split("/")[0] !=="image" && <>
              <button onClick={() => handleDownload(message.file?.media, message.file?.messageId+"_"+message.file?.filename, message.file?.mediaType)}>{message.file?.filename} (İndir)</button>
            </>}
        </Button>
        
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '100%' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2" style={{ position: "relative" }}>
              {message.body}
            </Typography>
            <div style={{ overflow: 'hidden', maxHeight: '100%' }}>
              <img
                className="max-h-screen"
                src={`data:image/jpeg;base64,${message.file?.media}`}
                alt="Media"
              />
            </div>
          </Box>
        </Modal>
      </div>
    );
}

export default MediaModal