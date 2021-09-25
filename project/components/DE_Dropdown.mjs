import Utils from "./Utils.mjs";

class DE_Dropdown extends HTMLElement 
{
  static name = "de-dropdown";

  constructor() 
  {
    super();

    //this.Show = this.Show.bind(this);
    //this.Hide = this.Hide.bind(this);
    this.On_Click_Src_Elem = this.On_Click_Src_Elem.bind(this);
    this.On_Click_Window = this.On_Click_Window.bind(this);
    this.On_Scroll_Window = this.On_Scroll_Window.bind(this);

    this.attachShadow({mode: 'open'});
  }

  connectedCallback()
  {
    this.Render();
  }

  static observedAttributes = ["src-elem"];
  attributeChangedCallback(attrName, oldValue, newValue)
  {
    if (attrName == "src-elem")
    {
      this.src_elem_id = newValue;
    }
  }

  set srcElem(elem)
  {
    this.Set_Src_Elem(elem);
  }

  Set_Src_Elem(elem)
  {
    this.src_elem = elem;
    elem.addEventListener("click", this.On_Click_Src_Elem);
  }

  set items(items)
  {
    this.Set_Items(items);
  }

  Set_Items(items)
  {
    const item_elem = document.createElement("span");
    item_elem.style.fontSize = "20px";
    item_elem.style.fontWeight = "bold";
    item_elem.style.padding = "0px 5px";
    item_elem.style.textAlign = "right";
    item_elem.style.backgroundColor = '#f2f2f2';
    item_elem.addEventListener("click", this.On_Click_Src_Elem);
    item_elem.innerHTML = "&#215;";
    this.shadowRoot.append(item_elem);

    for (const item of items)
    {
      const item_elem = document.createElement("span");
      item_elem.item_data = item.data;
      item_elem.classList.add("item");
      item_elem.addEventListener("click", item.action);
      item_elem.addEventListener('mouseup', this.On_Click_Src_Elem);
      item_elem.append(item.label);

      this.shadowRoot.append(item_elem);
    }
  }

  On_Click_Window(event)
  {
    const elems = event.composedPath();
    const is_menu_click = elems.includes(this);
    if (!is_menu_click)
    {
      this.Hide();
    }
  }

  On_Scroll_Window(event)
  {
    this.Hide();
  }

  On_Click_Src_Elem(event)
  {
    this.Toggle();
    event.stopPropagation();
  }

  Show()
  {
    let x, y;

    const padding = 10;
    const thisWidth = this.Get_Width(200);
    const docRect = window.document.body.getBoundingClientRect();
    const rect = this.src_elem.getBoundingClientRect();
    if (docRect.width - rect.left < thisWidth + padding)
    {
      x = docRect.width - thisWidth - padding;
      y = rect.bottom;
    }
    else
    {
      x = rect.left;
      y = rect.bottom;
    }

    if (!Utils.Is_Empty(window.ptDropdowns))
    {
      for (const ptDropdown of window.ptDropdowns)
      {
        ptDropdown.Hide();
      }
    }

    if (!Utils.Has_Value(window.ptDropdowns))
    {
      window.ptDropdowns = [];
    }
    window.ptDropdowns.push(this);

    this.style.left = x + "px";
    this.style.top = y + "px";
    this.style.display = "flex";
    window.addEventListener("click", this.On_Click_Window);
    window.addEventListener("scroll", this.On_Scroll_Window);
    window.addEventListener("resize", this.On_Scroll_Window);
  }

  Get_Width(def)
  {
    let width = parseInt(this.style.width);
    if (isNaN(width))
    {
      width = def;
    }
    return width;
  }

  Hide()
  {
    this.style.display = "none";
    window.removeEventListener("click", this.On_Click_Window);
    window.removeEventListener("scroll", this.On_Scroll_Window);
    window.removeEventListener("resize", this.On_Scroll_Window);
  }

  Toggle()
  {
    if (this.style.display == "flex")
    {
      this.Hide();
    }
    else
    {
      this.Show();
    }
  }

  Render()
  {
    this.style.display = "none";
    this.style.flexDirection = "column";
    this.style.cursor = "pointer";
    this.style.position = "fixed";
    this.style.border = "1px solid #ccc";
    this.style.backgroundColor = "#fff";
    this.style.boxShadow = 'grey 2px 2px 5px';
    this.style.zIndex = '10';
    
    const styleElem = document.createElement("style");
    styleElem.innerHTML = 
      `.item 
      {
        font-size: 13px;
        font-weight: normal;
        padding: 5px 10px;
      }
      .item:hover
      {
        background-color: #eee;
      }`;
    this.shadowRoot.appendChild(styleElem);

    if (this.src_elem_id)
    {
      const srcElem = document.getElementById(this.src_elem_id);
      this.Set_Src_Elem(srcElem);
    }
  }
}

export default DE_Dropdown;