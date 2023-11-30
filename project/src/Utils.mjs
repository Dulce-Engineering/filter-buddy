class Utils
{
  static appendStr(a, b, sep)
  {
    let res = null;

    if (sep == null || sep == undefined)
    {
      sep = "";
    }
    if (a && b && a.length > 0 && b.length > 0)
    {
      res = a + sep + b;
    } else if (a && !b && a.length > 0)
    {
      res = a;
    } else if (!a && b && b.length > 0)
    {
      res = b;
    }

    return res;
  }

  static Register_Element(elem_class)
  {
    const comp_class = customElements.get(elem_class.tname);
    if (comp_class == undefined)
    {
      customElements.define(elem_class.tname, elem_class);
    }
  }

  static addDays(date, days)
  {
    const res = new Date(date);
    res.setDate(res.getDate() + days);

    return res;
  }

  static nullIfEmpty(items)
  {
    let res = items;

    if (Utils.Is_Empty(items))
    {
      res = null;
    }

    return res;
  }

  static undefinedIfEmpty(items)
  {
    let res = items;

    if (Utils.Is_Empty(items))
    {
      res = undefined;
    }

    return res;
  }

  static Is_Empty(items)
  {
    let res = false;

    if (items == null || items == undefined)
    {
      res = true;
    }
    else if (Array.isArray(items))
    {
      if (items.length == 0)
      {
        res = true;
      }
    }
    else if (typeof items == "string")
    {
      const str = items.trim();
      if (str.length == 0 || str == "")
      {
        res = true;
      }
    }
    else if (typeof items == "object")
    {
      const keys = Object.keys(items);
      res = keys.length == 0;
    }
    else if (items.length == 0)
    {
      res = true;
    }

    return res;
  }

  static Has_Value(data)
  {
    let res = true;
    
    if (data == undefined || data == null)
    {
      res = false;
    }

    return res;
  }

  static nowDateStr()
  {
    return Utils.toDateStr(new Date());
  }

  static nowTimeStr()
  {
    return Utils.toTimeStr(new Date());
  }

  static isJson(str)
  {
    return str?.startsWith("{") || str?.startsWith("[");
  }

  static Deep_Copy(obj)
  {
    let res;

    if (!Utils.Is_Empty(obj))
    {
      const JSON_Str = JSON.stringify(obj);
      res = JSON.parse(JSON_Str);
    }

    return res;
  }

  // HTML =========================================================================================

  static Set_Id_Shortcuts(src_elem, dest_elem, attr_name = "id")
  {
    const elems = src_elem.querySelectorAll("[" + attr_name + "]");
    for (const elem of elems)
    {
      const id_value = elem.getAttribute(attr_name);
      dest_elem[id_value] = elem;
    }
  }

  static Hide_Elem_If(root_elem, id, exp_fn)
  {
    const elem = root_elem.querySelector("#" + id);
    if (elem)
    {
      elem.hidden = exp_fn();
    }
  }

  static getFromLocalStorgeInt(key, defaultValue)
  {
    return parseInt(Utils.getFromLocalStorge(key, defaultValue));
  }

  static getFromLocalStorge(key, defaultValue)
  {
    let res = defaultValue;

    const storageStr = localStorage.getItem(key);
    if (!Utils.Is_Empty(storageStr))
    {
      res = storageStr;
    }

    return res;
  }

  static appendStyles(id, css)
  {
    let style = document.getElementById(id);
    if (!style)
    {
      style = document.createElement("style");
      style.id = id;
      style.innerHTML = css;
      const head = document.getElementsByTagName("head")[0];
      head.appendChild(style);
    }
  }
  
  // HTTP =========================================================================================
  
  static fetchPostJson(url, xApiKey, bodyObj, auth)
  {
    let body;

    if (bodyObj)
    {
      body = JSON.stringify(bodyObj);
    }

    return Utils.fetchJson(url, "POST", xApiKey, body, auth);
  }
  
  static fetchGetJson(url, xApiKey)
  {
    return Utils.fetchJson(url, "GET", xApiKey);
  }
  
  static async fetchJson(url, method, xApiKey, body, auth)
  {
    let res = null;
    const options =
    {
      method,
      headers: 
      {
        'Content-Type': 'application/json',
        'x-api-key': xApiKey
      }
    };

    if (body)
    {
      options.body = body;
    }
    if (auth)
    {
      options.headers.Authorization = auth;
    }
    
    const httpRes = await fetch(url, options);
    if (httpRes)
    {
      const textRes = await httpRes.text();
      res = JSON.parse(textRes);
    }

    return res;
  }
  
  static async fetch(url, method, xApiKey, body)
  {
    let res = null;
    const options =
    {
      method,
      headers: 
      {
        'Content-Type': 'application/json',
        'x-api-key': xApiKey
      }
    };

    if (body)
    {
      options.body = body;
    }
    
    const httpRes = await fetch(url, options);
    if (httpRes)
    {
      res = await httpRes.text();
    }

    return res;
  }

  static appendParam(params, paramName, paramValue)
  {
    return Utils.appendStr(params, paramName + "=" + paramValue, "&");
  }

  static Add_Param(url, param_name, param_Value)
  {
    if (param_Value)
    {
      let sep = "&";

      if (!url.includes("?"))
      {
        sep = "?";
      }
      url = Utils.appendStr(url, param_name + "=" + param_Value, sep);
    }

    return url;
  }

  // cast =========================================================================================

  static toEmptyStr(value)
  {
    let res = value;
    
    if (value == null || value == undefined)
    {
      res = "";
    }

    return res;
  }

  static toDocument(html) 
  {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  }

  static toElement(html) 
  {
    return Utils.toDocument(html).firstChild;
  }

  static toElements(html) 
  {
    return Utils.toDocument(html).childNodes;
  }

  static toBoolean(valStr)
  {
    let res = false;

    if (valStr)
    {
      valStr = valStr.toLowerCase();
      if (valStr == "true" || valStr == "yes" || valStr == "t")
      {
        res = true;
      }
    }

    return res;
  }

  static toDateStr(date)
  {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dateStr = year + "-" + Utils.to2DigitStr(month) + "-" + Utils.to2DigitStr(day);

    return dateStr;
  }

  static toTimeStr(date)
  {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const meridiem = hours >= 0 && hours < 12 ? "am": "pm";
    
    let hours12;
    if (hours == 0)
    {
      hours12 = 12;
    }
    else if (hours > 12)
    {
      hours12 = hours - 12;
    }
    else
    {
      hours12 = hours;
    }

    const timeStr = hours12 + ":" + Utils.to2DigitStr(minutes) + " " + meridiem;

    return timeStr;
  }

  static to2DigitStr(number)
  {
    let res;

    if (number < 10)
    {
      res = "0" + number;
    }
    else
    {
      res = "" + number;
    }

    return res;
  }

  static toArray(str)
  {
    let res = null;

    if (str)
    {
      const strObj = JSON.parse(str);
      if (strObj && Array.isArray(strObj) && strObj.length > 0)
      {
        res = strObj;
      }
    }

    return res;
  }

  static toValueArray(str)
  {
    let res = null;
    const strArray = Utils.toArray(str);

    if (strArray)
    {
      res = strArray.map(item => item.value);
    }

    return res;
  }

  static toJSONStr(obj)
  {
    let res;

    if (obj)
    {
      res = JSON.stringify(obj);
    }

    return res;
  }

  static toInt(value, def)
  {
    let res = def;

    if (Utils.Has_Value(value))
    {
      const intValue = parseInt(value);
      if (!isNaN(intValue))
      {
        res = intValue;
      }
    }

    return res;
  }
}

export default Utils;
