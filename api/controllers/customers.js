const asyncErrorWrapper = require("express-async-handler");
const { getAllCustomers, findChat, filteredCustomer, notification } = require("../helpers/db");
const { sortMessages } = require("../helpers/message/sorting");
const CustomError = require("../helpers/error/CustomError");

const getCustomers = asyncErrorWrapper(async(req, res)=>{
  
  const customers = await getAllCustomers();

  res.status(200).json({
    success:true,
    data:customers
  })
})

const getChat = asyncErrorWrapper(async (req, res) => {
  const { phoneNumber } = req.params;
  const { limit, offset } = req.query;
  
  const chat = await findChat(phoneNumber, limit, offset);

  if(!chat) return new CustomError("Chat doesn't exist.", 404);

  const sortedMessages = sortMessages(chat.messages);

  const sortedChat = { ...chat, messages: sortedMessages };
  res.status(200).json({
    success: true,
    data: sortedChat,
  });
});

const notificationSetter = asyncErrorWrapper(async (req, res) => {
  const { phoneNumber } = req.params;
  
  const chat = await notification(phoneNumber);

  if(!chat) return new CustomError("Chat doesn't exist.", 404);

  res.status(200).json({
    success: true,
  });
});

const getFilteredCustomers = asyncErrorWrapper(async (req, res) => {


  const filteredCustomers = await filteredCustomer(req);
  let data = []


  const uniqueCustomers = filteredCustomers.reduce((unique, item) => {
    if (item.customer && !unique.some((uniqueItem) => uniqueItem.id === item.customer.id)) {
      item.customer.notification = item.chat.notification
      unique.push(item.customer);
    }
    return unique;
  }, []);
  res.status(200).json({
    success: true,
    data:uniqueCustomers
  });
});
const test = asyncErrorWrapper(async (req, res) => {


  const filteredCustomers = await filteredCustomer(req);


  res.status(200).json({
    success: true,
    data:filteredCustomers
  });
});

// const test = asyncErrorWrapper(async(req, res)=>{

//   const chat = messageDetails()

//   res.status(200).json({
//     data:chat
//   });

// })


module.exports = {
    getCustomers,
    getChat,
    getFilteredCustomers,
    notificationSetter,
    test
}
