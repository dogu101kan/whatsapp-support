import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import { setAccount } from "../../redux-store/auth/actions";

export const Login = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false)
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleSubmit = (e) => {
    setLoading(true);
    let url = apiURL + "/auth/login";

    let headers = new Headers();

    headers.append("Content-Type", "application/json");

    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((json) => {
        setLoading(false);
        if(json.success===true){
          cookies.set('token', json.access_token);
          setAccount({token: json.access_token, username:json.data.username, id:json.data.id});
          navigate("/chat");
          setErr(false)
        }else{
          setErr(json.message);
        }
      })
      .catch(setLoading(false));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center gap-2">
        <label className="flex gap-2 text-sm">
          <p className="ml-3">Username</p>
          <input
            id="username"
            type="username"
            placeholder="kullanici adi"
            onChange={handleChange}
          />
        </label>
        <label className="flex gap-2 text-sm">
          <p className="ml-3">Password</p>
          <input
            id="password"
            type="password"
            placeholder="*******"
            onChange={handleChange}
          />
        </label>
      <button onClick={handleSubmit} className="border bg-neutral-200 px-3 p-1 rounded-xl mt-5">{loading?"Loading..":"Sign IN"}</button>
      <Link onClick={()=>navigate("/register")} className="text-blue-500">{"Go to Register Page"}</Link>
      {err && (<p>{err.toString()}</p>)}
    </div>
  );
};
