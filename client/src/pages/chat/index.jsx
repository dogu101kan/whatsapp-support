import { useState, useEffect, useRef } from "react";
import { parseJwt } from "../../utils/jwtParser";
import { Contact } from "../../components/contacts";
import { Message } from "../../components/message";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import NotificationSound from "../../assets/sounds/notification-sound.mp3";
import QRModal from "../../components/qrModal";
import Cookies from "universal-cookie";
import io from "socket.io-client";

const socket = io.connect(apiURL_SOCKET);

const Chat = () => {
  const cookies = new Cookies();

  const audioPlayer = useRef(null);
  const lastMessage = useRef();
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [selectedPhone, setSelectedPhone] = useState();
  const [qr, setQr] = useState(null);
  const [customers, setCustomers] = useState();
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [textFilter, setTextFilter] = useState("");
  const [currentCustomer, setCurrentCustomer] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState();
  const [notification, setNotification] = useState(false);
  const [hasFixedFilter, setHasFixedFilter] = useState(false);
  const [filters, setFilters] = useState(null);
  const [allFixed, setAllFixed] = useState(false);
  const [scrollIntoView, setScrollIntoView] = useState(false);
  const [newMessageForSlider, setNewMessageForSlider] = useState(false); ////////////
  const [selecetedMessage, setSelectedMessage] = useState(null);
  const [base64Data, setBase64Data] = useState(null);
  const [topicOptions, setTopicOptions] = useState([]);
  const [subTopicOptions, setSubTopicOptions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [selectedSubTopic, setSelectedSubTopic] = useState(0);
  const [scrollHeight, setScrollHeight] = useState();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [firstDateFilter, setFirstDateFilter] = useState(null);
  const [secondDateFilter, setSecondDateFilter] = useState(null);
  const [userAccess, setUserAccess] = useState(false);
  const [userAccessUsername, setUserAccessUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  const playAudio = () => {
    audioPlayer.current.play();
  };

  useEffect(() => {
    if (!textFilter) {
      setFilteredCustomers(customers);
    } else {
      customers &&
        setFilteredCustomers(
          customers.filter((customer) => {
            const phoneNumber = customer.phoneNumber
              .toLowerCase()
              .includes(textFilter.toLowerCase());
            const username = customer.username
              ?.toLowerCase()
              .includes(textFilter.toLowerCase());

            return phoneNumber || username;
          })
        );
    }
  }, [textFilter]);

  useEffect(() => {
    let wp_message = (data) => {
      playAudio();
      if (currentCustomer === data.customerId) {
        setMessages((prev) => [...prev, data]);
        setNewMessageForSlider(true);
    }else setNotification(true);
    };
    socket.on("wp_message", wp_message);
    return () => {
      socket.off("wp_message", wp_message);
    };
  }, [socket, messages]);

  useEffect(() => {
    let wp_qr = (data) => {
      setQr(data);
    };
    socket.on("wp_qr", wp_qr);
    return () => {
      socket.off("wp_qr", wp_qr);
    };
  }, [socket, qr]);

  useEffect(() => {
    setLoading(true);
    let url;
    url = apiURL + `/customer/getfilteredchats?hasFixed=${hasFixedFilter}&topicId=${selectedTopic}&subTopicId=${selectedSubTopic}&firstDate=${firstDateFilter}&secondDate=${secondDateFilter}`;

    let headers = new Headers();
    headers.append("authorization", "Bearer " + cookies.get("token"));

    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success === false) {
          setCustomers(false);
          cookies.remove("token");
        } else {
          setCustomers(json.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
    setNotification(false);
  }, [
    messages,
    notification,
    hasFixedFilter,
    allFixed,
    selectedTopic,
    selectedSubTopic,
    firstDateFilter,
    secondDateFilter
  ]);

  useEffect(() => {
    setLoading(true);

    const url = apiURL + "/message/topics";

    let headers = new Headers();
    headers.append("authorization", "Bearer " + cookies.get("token"));

    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success === false) {
        } else {
          setTopicOptions(
            json.data.map((item) => ({
              label: item.topicName,
              value: item.id,
            }))
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    const url = apiURL + "/message/subtopics";

    let headers = new Headers();
    headers.append("authorization", "Bearer " + cookies.get("token"));

    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success === false) {
        } else {
          setSubTopicOptions(
            json.data.map((item) => ({
              label: item.subTopicName,
              value: item.id,
            }))
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(()=>{
    let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        let url = apiURL + `/customer/${selectedPhone}/notification`
        fetch(url, {
            method: "GET",
            headers: headers,
          })
          
  }, [selectedPhone])

  useEffect(() => {
    setOffset(0);
    setLimit(20);
    if (selectedPhone !== undefined && selectedPhone !== null) {
      setLoading(true);
      let url = apiURL + `/customer/${selectedPhone}?limit=${20}&offset=${0}`;
      let headers = new Headers();
      headers.append("authorization", "Bearer " + cookies.get("token"));

      fetch(url, {
        method: "GET",
        headers: headers,
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.success === false) {
            setMessages([]);
          } else {
            setMessages([]);
            setMessages(json.data.messages);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [selectedPhone, allFixed]);

  useEffect(() => {
    if (selectedPhone !== undefined && selectedPhone !== null && offset !== 0) {
      setLoading(true);
      let url = apiURL + `/customer/${selectedPhone}?limit=${limit}&offset=${offset}`;
      let headers = new Headers();
      headers.append("authorization", "Bearer " + cookies.get("token"));
      

      fetch(url, {
        method: "GET",
        headers: headers,
      })
        .then((response) => response.json())
        .then((json) => {
          setInfiniteScroll(!infiniteScroll)
          if (json.success === false) {
            setMessages([]);
          } else {
            json.data.messages &&
              setMessages((prev) => [...json.data.messages, ...prev]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
      
    }
  }, [offset]);

  const handleAccessFetch = () => {
    
    setLoading(true);
    let url = apiURL + `/user/useraccess?status=${userAccess}&username=${userAccessUsername}`;
    let headers = new Headers();
    headers.append("authorization", "Bearer " + cookies.get("token"));

    fetch(url, {
            method: "GET",
            headers: headers,
          })
            .catch((err) => {
              console.log(err);
              setLoading(false);
            });
  }



  const handleSendMessage = () => {
    let data;

    if (base64Data !== null) {
      data = {
        hasMedia: true,
        hasFixed: true,
        message: newMessage,
        userId: user.id,
        file: {
          media: base64Data.data,
          mediaType: base64Data.mediaType,
          filename: base64Data.filename,
        },
      };
    } else {
      data = {
        hasMedia: false,
        hasFixed: true,
        message: newMessage,
        userId: user.id,
        customerId: null,
        file: {
          media: null,
          mediaType: null,
          filename: null,
        },
      };
    }
    socket.emit("new_message", { ...data, selectedPhone });

    messages
      ? setMessages([...messages, { ...data, createdAt: new Date() }])
      : setMessages([{ ...data, createdAt: new Date() }]);
    setNewMessage("");
    setBase64Data(null);

    let fileInput = document.getElementById("fileInput");
    fileInput.value = null;
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      setNewMessage((prevMessage) => prevMessage + '\n');
    }else if (event.key === "Enter") {
      handleSendMessage();
      setNewMessage("");
    }
  };

  const handleFilterInputKeyPress = (event) => {
    if (event.key === "Enter") {
      if (
        !textFilter.match(
          /^[\]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
        )
      )
        return;
      setSelectedPhone(textFilter);
      setTextFilter("");
    }
  };

  const handleAllMessageFixed = () => {
    if (!currentCustomer) return;
    setLoading(true);
    let url = apiURL + `/message/allmessagesfixed/${currentCustomer}`;
    let headers = new Headers();
    headers.append("authorization", "Bearer " + cookies.get("token"));

    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success === false) {
        } else {
          setAllFixed(!allFixed);
          setSelectedPhone("");
          setMessages([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    user && socket.emit("addUser", user.id);
  }, [user]);

  useEffect(() => {
    setUser(parseJwt(cookies.get("token")));
  }, [socket]);

  useEffect(() => {
    const chatdiv = document.getElementById("chatdiv");    

    if (offset != 0) {
      chatdiv.scrollTo(0, chatdiv.scrollHeight - scrollHeight);
    }
    
  }, [infiniteScroll]);

  useEffect(()=>{
    scrollIntoView &&
      lastMessage.current?.scrollIntoView({ behavior: "smooth" });
      setScrollIntoView(false);
      setScrollOffset(0)
  },[scrollIntoView])

  useEffect(()=>{
    scrollOffset === 0 && lastMessage.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessageForSlider(false);
  },[messages])

  useEffect(() => {
    const handleScroll = () => {
      const chatdiv = document.getElementById("chatdiv");
      const currentHeight = chatdiv.scrollTop;
      
      if (currentHeight === 0) {
        setOffset(offset + limit);
        setScrollOffset(offset)
      } else {
        setScrollHeight(chatdiv.scrollHeight);
      }
    };
    chatdiv.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

      if (file.size > maxSizeInBytes) {
        setErr({ message: "Dosya boyutu 10 MB'dan büyük." });
      } else {
        const base64File = await convertFileToBase64(file);
        setBase64Data({
          mediaType: file.type,
          data: base64File,
          filename: file.name,
        });
      }
    }
  };

  async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  const chatRemove = () => {
    setSelectedPhone("");
    setMessages([]);
    setCurrentCustomer(null);
    setSelectedMessage(null);
    setBase64Data(null);
  };

  return (
      <div className="flex h-screen">
          <audio ref={audioPlayer} src={NotificationSound} />
          <div className="w-1/4 flex flex-col h-screen bg-[#111b21] text-[#e1e5e7] border-r border-[#222a2f]">
              <div className="flex items-center mb-4 p-4 bg-gradient-to-t from-[#1b272c] via-[#202c33] to-[#1b272c] border-none">
                  <div className="text-xl font-semibold flex flex-row">Yetkilendirme</div>
                  <input type="checkbox" className="ml-2" onChange={()=>{
                    setUserAccess(!userAccess)
                  }}/>
                  <input type="text" className="max-w-[5rem] mx-1" onChange={(e)=>{
                    setUserAccessUsername(e.target.value)
                  }}/>
                  <button onClick={handleAccessFetch}>OK</button>
                  <div className="ml-6">
                      {qr !== null && <QRModal qr={qr} />}
                  </div>
              </div>
              <div className="px-4 py-1 flex flex-col bg-[#111b21] text-[#e1e5e7]">
                  <div className="ml-2 mb-4">
                      <p className="font-bold text tracking-widest text-xl">
                          FILTERS
                      </p>
                      <div className="flex mt-1 gap-4">
                          <label className="flex gap-2 justify-center items-center">
                              <input
                                  type="checkbox"
                                  onChange={() => {
                                      setHasFixedFilter(!hasFixedFilter);
                                      setSelectedPhone(null);
                                  }}
                              />
                              <p>Çözülmeyenler</p>
                          </label>

                          <FormControl fullWidth>
                              <InputLabel id="dropdown-label">
                                  Seçenek
                              </InputLabel>
                              <Select
                                  labelId="dropdown-label"
                                  id="dropdown"
                                  label="Seçenek"
                                  value={selectedTopic} // value prop'unu durumla senkronize edin
                                  onChange={(e) =>
                                      setSelectedTopic(e.target.value)
                                  }
                              >
                                  <MenuItem key="defaulttopic" value={0}>
                                      Hepsi
                                  </MenuItem>
                                  {topicOptions.map((option) => (
                                      <MenuItem
                                          key={option.value}
                                          value={option.value}
                                      >
                                          {option.label}
                                      </MenuItem>
                                  ))}
                              </Select>
                          </FormControl>

                          <FormControl fullWidth>
                              <InputLabel id="dropdown-label">
                                  Seçenek
                              </InputLabel>
                              <Select
                                  labelId="dropdown-label"
                                  id="dropdown"
                                  label="Seçenek"
                                  value={selectedSubTopic}
                                  onChange={(e) => {
                                      setSelectedSubTopic(() => e.target.value);
                                  }}
                              >
                                  <MenuItem key={"defaultsubtopic"} value={0}>
                                      Hepsi
                                  </MenuItem>
                                  {subTopicOptions.map((option) => (
                                      <MenuItem
                                          key={option.value}
                                          value={option.value}
                                      >
                                          {option.label}
                                      </MenuItem>
                                  ))}
                              </Select>
                          </FormControl>
                      </div>
                      <div className="flex gap-2 mt-1 w-full">
                          <label className="flex-shrink-0 max-w-[10rem]">
                              <p className="text-sm">Baslangic Tarihi</p>
                              <DatePicker
                                  className="bg-[#2a3942] text-[#e1e5e7] w-full"
                                  selected={
                                      firstDateFilter &&
                                      new Date(firstDateFilter)
                                  }
                                  onChange={(date) =>
                                      setFirstDateFilter(
                                          date !== null
                                              ? date.toISOString()
                                              : null
                                      )
                                  }
                                  dateFormat="dd/MM/yyyy"
                              />
                          </label>
                          <label className="flex-shrink-0 max-w-[10rem]">
                              <p className="text-sm">Bitis Tarihi</p>
                              <DatePicker
                                  className="bg-[#2a3942] text-[#e1e5e7] w-full"
                                  selected={
                                    secondDateFilter &&
                                      new Date(secondDateFilter)
                                  }
                                  onChange={(date) =>
                                      setSecondDateFilter(
                                          date !== null
                                              ? date.toISOString()
                                              : null
                                      )
                                  }
                                  dateFormat="dd/MM/yyyy"
                              />
                          </label>
                      </div>
                  </div>
                  <div className="bg-[#2a3942] p-2 rounded-full flex items-center">
                      <svg
                          className="w-6 h-6 text-gray-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m0 0l-6-6m6 6l-6 6m6-6L3 3m6 6l6 6M3 3l6 6m10 2l2-2-6-6-2 2"
                          ></path>
                      </svg>
                      <input
                          type="text"
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="Search or start new chat"
                          onKeyDown={(e) => handleFilterInputKeyPress(e)}
                          onChange={(e) => setTextFilter(e.target.value)}
                      />
                  </div>
              </div>
              <div className="mt-4 overflow-y-auto">
                  {filteredCustomers &&
                      filteredCustomers.map((customer, index) => (
                          <Contact
                              key={index}
                              customer={customer}
                              setSelectedPhone={setSelectedPhone}
                              selectedPhone={selectedPhone}
                              setCurrentCustomer={setCurrentCustomer}
                              setMessages={setMessages}
                          />
                      ))}
                  {!filteredCustomers &&
                      customers &&
                      customers.map((customer, index) => (
                          <Contact
                              key={index}
                              customer={customer}
                              setSelectedPhone={setSelectedPhone}
                              selectedPhone={selectedPhone}
                              setCurrentCustomer={setCurrentCustomer}
                              setMessages={setMessages}
                          />
                      ))}
              </div>
          </div>
          <div className="w-3/4 h-full flex flex-col relative">
              <div className="flex items-center justify-between bg-gradient-to-t from-[#1b272c] via-[#202c33] to-[#1b272c] border-none text-[#e1e5e7] p-4 border-b">
                  <div className="flex items-center">
                      {/* <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="rounded-full mr-2"
            /> */}
                      <div className="font-semibold">{selectedPhone}</div>
                  </div>
                  <div className="flex items-center h-10">
                      {selectedPhone && (
                          <div className="flex">
                              <button
                                  onClick={handleAllMessageFixed}
                                  className="flex gap-2 p-2 mx-4 items-center justify-center text-[#e1e5e7] hover:bg-[#2a3942] rounded-lg"
                              >
                                  Sorunlar çözüldü
                              </button>
                              <div
                                  className="hover:bg-[#2a3942] rounded-lg p-2"
                                  onClick={chatRemove}
                              >
                                  <svg
                                      className="w-6 h-6 text-[#aebac1] cursor-pointer"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M6 18L18 6M6 6l12 12"
                                      ></path>
                                  </svg>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
              <div
                  id={"chatdiv"}
                  className="flex-1 p-4 overflow-y-auto"
                  style={{ backgroundImage: `url("/img/bg.jpg")` }}
              >
                  {messages &&
                      messages.map((message, index) => (
                          <div
                              key={index}
                              ref={
                                  index === messages.length - 1
                                      ? lastMessage
                                      : null
                              }
                          >
                              <Message
                              hasFixedFilter={hasFixedFilter}
                              selectedTopic={selectedTopic}
                              selectedSubTopic={selectedSubTopic}
                                  message={message}
                                  selecetedMessage={selecetedMessage}
                                  setSelectedMessage={setSelectedMessage}
                                  topicOptions={topicOptions}
                                  subTopicOptions={subTopicOptions}
                              />
                          </div>
                      ))}
              </div>
              <button
                  className="absolute bottom-28 right-10 rounded-full bg-[#202c33] w-12 h-12 shadow-lg shadow-[#202c33]"
                  onClick={() => setScrollIntoView(true)}
              >
                  <svg
                      className="svg-icon font-thin -rotate-90"
                      viewBox="-1.5 -2.5 25 25"
                  >
                      <path
                          fill="white"
                          d="M8.388,10.049l4.76-4.873c0.303-0.31,0.297-0.804-0.012-1.105c-0.309-0.304-0.803-0.293-1.105,0.012L6.726,9.516c-0.303,0.31-0.296,0.805,0.012,1.105l5.433,5.307c0.152,0.148,0.35,0.223,0.547,0.223c0.203,0,0.406-0.08,0.559-0.236c0.303-0.309,0.295-0.803-0.012-1.104L8.388,10.049z"
                      ></path>
                  </svg>
              </button>
              <div className="bg-gradient-to-t from-[#1b272c] via-[#202c33] to-[#1b272c] p-4">
                  {selectedPhone && (
                      <div className="flex items-center">
                          <textarea
                              onKeyDown={(e) => handleKeyPress(e)}
                              rows={1}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="flex-1 resize-none bg-[#2a3942] text-[#e1e5e7] rounded p-2 mr-2 focus:outline-none"
                              placeholder="Type a message..."
                          />
                          <button
                              onClick={handleSendMessage}
                              className="bg-green-500 text-[#e1e5e7] px-4 py-2 rounded"
                          >
                              Send
                          </button>
                          <label>
                              <input
                                  id="fileInput"
                                  type="file"
                                  hidden
                                  onChange={handleFileChange}
                              />
                              <svg
                                  htmlFor="fileInput"
                                  className="w-10 h-10 pl-2 ml-2 cursor-pointer text-white"
                                  fill="white"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 5v.01M12 12v.01M12 19v.01M5 12h.01M12 12l-6 6m6-6l6 6"
                                  ></path>
                              </svg>
                          </label>
                          {err && <p>{err.message}</p>}
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <ChatApp />
//       </header>
//     </div>
//   );
// }

export default Chat;
