import Utils from "./Utils.mjs";
import ptDropdown from "./DE_Dropdown.mjs"

class Filter_Buddy extends HTMLElement 
{
  static name = "filter-buddy";

  // lifecycle ====================================================================================

  constructor() 
  {
    super();
    this.OnClick_Switch_View_Btn = this.OnClick_Switch_View_Btn.bind(this);
    this.OnClick_Set_View = this.OnClick_Set_View.bind(this);
    this.OnClick_Min_Add_Filter_Btn = this.OnClick_Min_Add_Filter_Btn.bind(this);
    this.OnClick_Mid_Add_Filter_Btn = this.OnClick_Mid_Add_Filter_Btn.bind(this);
    this.OnClick_Search_Btn = this.OnClick_Search_Btn.bind(this);
    this.OnClick_Del_Filter_Btn = this.OnClick_Del_Filter_Btn.bind(this);
  }

  connectedCallback()
  {
    const rootElem = this.Render();
    this.replaceChildren(rootElem);
    this.view = "max";
  }

  disconnectedCallback()
  {

  }

  adoptedCallback()
  {

  }

  //static observedAttributes = ['a1', "a2", "a3"];
  attributeChangedCallback(attrName, oldValue, newValue)
  {

  }

  // fields =======================================================================================

  // input types: text, time, time_range, date, date_range, timestamp, timestamp_range,
  // boolean, one_off, integer, integer_range, float, float_range, currency, currency_range
  // auto_complete
  
  set filters(filter_defs)
  {
    /*
      filterDefs =
      [
        {
          id: "WHERE_SOURCE",
          inputType: "text", 
          in_mid_view: true
        }
      ]
    */
    this.filter_defs = filter_defs;
    this.Render_View(this.mid_filter_defs, "mid_filters_div", "mid");
    this.Render_View(this.filter_defs, "max_filters_div", "max");
  }

  set view(view_name)
  {
    this.Get_View_Data();
    this.Show_View(view_name);
    this.Set_View_Data();

    this.Render_Update_Summ();
  }

  get view()
  {
    let res;

    if (!this.min_view_div.hidden)
    {
      res = "min";
    }
    else if (!this.mid_view_div.hidden)
    {
      res = "mid";
    }
    else if (!this.max_view_div.hidden)
    {
      res = "max";
    }

    return res;
  }

  get mid_filter_defs()
  {
    let res;

    if (this.filter_defs)
    {
      res = this.filter_defs.filter(d => d.in_mid_view);
    }

    return res;
  }

  // events =======================================================================================

  OnClick_Switch_View_Btn()
  {

  }

  OnClick_Set_View(event)
  {
    this.view = event.target.item_data;
  }

  OnClick_Min_Add_Filter_Btn()
  {
    this.return_view = "min";
    this.view = "max";
  }

  OnClick_Mid_Add_Filter_Btn()
  {
    this.return_view = "mid";
    this.view = "max";
  }

  OnClick_Search_Btn()
  {
    this.Get_View_Data();
    const filter_data = this.Get_Data();
    const search_event = new CustomEvent("search", {detail: filter_data});
    this.dispatchEvent(search_event);

    if (this.return_view)
    {
      this.view = this.return_view;
      this.return_view = null;
    }
  }

  OnClick_Del_Filter_Btn(def)
  {
    def.value = undefined;
    this.Render_Update_Summ();
  }

  // misc =========================================================================================

  Has_Filters()
  {
    let res = false;

    if (!Utils.isEmpty(this.filter_defs))
    {
      res = this.filter_defs.some(def => def.value != undefined);
    }

    return res;
  }

  Has_Max_Filters()
  {
    let res = false;

    if (!Utils.isEmpty(this.filter_defs))
    {
      res = this.filter_defs.some(def => def.in_mid_view != true);
    }

    return res;
  }

  Get_View_Data()
  {
    const view = this.view;

    const defs = this.Get_Current_Defs();
    if (!Utils.isEmpty(defs))
    {
      for (const def of defs)
      {
        const filter = def[view + "_filter"];
        def.value = filter.value;
        if (filter.Get_Text)
        {
          def.text = filter.Get_Text(def.value);
        }
      }
    }
  }

  Set_View_Data()
  {
    const view = this.view;

    const defs = this.Get_Current_Defs();
    if (!Utils.isEmpty(defs))
    {
      for (const def of defs)
      {
        const filter = def[view + "_filter"];
        filter.value = def.value;
      }
    }
  }

  Get_Data()
  {
    const res = {};

    if (!Utils.isEmpty(this.filter_defs))
    {
      for (const def of this.filter_defs)
      {
        res[def.id] = def.value;
      }
    }

    return res;
  }

  Get_Current_Defs()
  {
    let defs;

    const view = this.view;
    if (view == "mid")
    {
      defs = this.mid_filter_defs;
    }
    else if (view == "max")
    {
      defs = this.filter_defs;
    }

    return defs;
  }

  // rendering ====================================================================================

  Show_View(view_name)
  {
    this.min_view_div.hidden = true;
    this.mid_view_div.hidden = true;
    this.max_view_div.hidden = true;
    this[view_name + "_view_div"].hidden = false;

    if (view_name == "min")
    {
      const min_search_btn = this.querySelector("#min_search_btn");
      if (min_search_btn)
      {
        min_search_btn.hidden = !this.Has_Filters();
      }
    }

    if (view_name == "mid")
    {
      const mid_add_filter_btn = this.querySelector("#mid_add_filter_btn");
      if (mid_add_filter_btn)
      {
        mid_add_filter_btn.hidden = !this.Has_Max_Filters();
      }
    }
  }

  Render_Update_Summ()
  {
    const view = this.view;
    const summ_div = this.querySelector("#" + view + "_summ_div");
    if (summ_div)
    {
      const summary_elems = [];

      let defs = this.filter_defs;
      if (view == "mid")
      {
        defs = this.filter_defs.filter(d => !d.in_mid_view);
      }

      if (!Utils.isEmpty(defs))
      {
        for (const def of defs)
        {
          const summary_elem = this.Render_Summary_Elem(def);
          if (summary_elem)
          {
            summary_elems.push(summary_elem);
          }
        }
      }
      summ_div.replaceChildren(...summary_elems);
    }
  }

  Render_Summary_Elem(def)
  {
    let span;

    const value = def.value;
    if (value)
    {
      const delete_btn = document.createElement("button");
      delete_btn.addEventListener("click", () => this.OnClick_Del_Filter_Btn(def));
      delete_btn.classList.add("fb_del_btn");
      delete_btn.innerHTML = "&Cross;";

      span = document.createElement("span");
      if (def.text)
      {
        span.innerText = def.label + ": " + def.text;
      }
      else
      {
        span.innerText = def.label + ": " + value;
      }
      span.classList.add("fb_summ");
      span.append(delete_btn);
    }

    return span;
  }

  Render_View(filter_defs, filters_div_id, view)
  {
    if (!Utils.isEmpty(filter_defs))
    {
      const elems = [];
      for (const filter_def of filter_defs)
      {
        const filter = new filter_def.filter_class(filter_def);
        const filter_elems = filter.Render();
        elems.push(filter_elems);

        filter_def[view + "_filter"] = filter;
      }
      
      const filters_div = this.querySelector("#" + filters_div_id);
      filters_div.replaceChildren(...elems.flat());
    }
  }

  Render_Filter_Status()
  {

  }

  Render()
  {
    const filter_svg = `
      <svg 
        class="fb_filter_img" 
        aria-hidden="true" 
        focusable="false" 
        data-prefix="fas" 
        data-icon="filter" 
        class="svg-inline--fa fa-filter fa-w-16" 
        role="img" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 512 512">
        <path 
          fill="currentColor" 
          d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z">
        </path>
      </svg>`;
    const html = `
      <style>
        .fb_del_btn
        {
          border: none;
          background: none;
          padding: 0;
          margin: 0px 0px 0px 4px;
          cursor: pointer;
          font-size: 14px;
          color: #888;
          font-weight: bold;
        }
        .fb_summ
        {
          background-color: #ddd;
          border-radius: 100px;
          font-family: sans-serif;
          font-size: 10px;
          padding: 4px 6px;
          margin: 0px 2px;
        }
        .fb_filter_btn
        {
          height: 22px;
        }
        .fb_filter_img
        {
          height: 8px;
        }
        #mid_filters_div
        {
          display: inline-flex;
          gap: 5px;
          font-family: sans-serif;
          font-size: 12px;
          align-items: center;
        }
        #mid_filters_div label
        {
          margin-left: 10px;
        }
        #mid_btn_span
        {
          margin-left: 10px;
        }
      </style>

      <button id="switchViewBtn">view</button>
      <span id="switchViewListPlaceholder"></span>

      <span id="min_view_div">
        <button id="min_add_filter_btn" class="fb_filter_btn">${filter_svg}</button>
        <span id="min_summ_div"></span>
        <button id="min_search_btn">&telrec;</button>
      </span>

      <span id="mid_view_div">
        <span id="mid_filters_div"></span>
        <span id="mid_btn_span">
          <button id="mid_add_filter_btn" class="fb_filter_btn">${filter_svg}</button>
          <button id="mid_search_btn">&telrec;</button>
        </span>
        <div id="mid_summ_div"></div>
      </span>

      <div id="max_view_div">
        <div id="max_filters_div"></div>
        <button id="max_search_btn">Search</button>
      </div>
    `;
    const doc = Utils.toDocument(html);

    let search_btn = doc.getElementById("min_search_btn");
    search_btn.addEventListener("click", this.OnClick_Search_Btn);
    search_btn = doc.getElementById("mid_search_btn");
    search_btn.addEventListener("click", this.OnClick_Search_Btn);
    search_btn = doc.getElementById("max_search_btn");
    search_btn.addEventListener("click", this.OnClick_Search_Btn);

    const min_add_filter_btn = doc.getElementById("min_add_filter_btn");
    min_add_filter_btn.addEventListener("click", this.OnClick_Min_Add_Filter_Btn);
    const mid_add_filter_btn = doc.getElementById("mid_add_filter_btn");
    mid_add_filter_btn.addEventListener("click", this.OnClick_Mid_Add_Filter_Btn);

    this.min_view_div = doc.getElementById("min_view_div");
    this.mid_view_div = doc.getElementById("mid_view_div");
    this.max_view_div = doc.getElementById("max_view_div");

    this.switchViewBtn = doc.getElementById("switchViewBtn");
    this.switchViewBtn.addEventListener("click", this.OnClick_Switch_View_Btn);

    //await window.customElements.whenDefined('pt-dropdown');
    const items = 
    [
      {label: 'Close', action: this.OnClick_Set_View, data: "min"},
      {label: 'Minimal', action: this.OnClick_Set_View, data: "mid"},
      {label: 'Open', action: this.OnClick_Set_View, data: "max"},
    ];
    const switchViewList = new ptDropdown();
    switchViewList.items = items;
    switchViewList.srcElem = this.switchViewBtn;
    switchViewList.style.width = "100px";
    doc.getElementById("switchViewListPlaceholder").append(switchViewList);

    return doc;
  }
}

class Text
{
  constructor(def)
  {
    this.def = def;
  }

  set value(input_value)
  {
    this.input.value = "";
    if (!Utils.isEmpty(input_value))
    {
      this.input.value = input_value;
    }
  }

  get value()
  {
    let res;

    const input_value = this.input.value;
    if (!Utils.isEmpty(input_value))
    {
      res = input_value;
    }

    return res;
  }

  Render()
  {
    this.input = document.createElement("input");
    this.input.id = "ptFilter_" + this.def.id;

    this.label = document.createElement("label");
    this.label.for = this.input.id;
    this.label.innerText = this.def.label;

    return [this.label, this.input];
  }
}
Filter_Buddy.Text = Text;

class Select
{
  constructor(def)
  {
    this.def = def;
  }

  set value(input_value)
  {
    this.select.value = "";
    if (!Utils.isEmpty(input_value))
    {
      this.select.value = input_value;
    }
  }

  Get_Text(input_value)
  {
    let text;

    const option = this.select.querySelector("option[value='" + input_value + "']");
    if (option)
    {
      text = option.innerText;
    }

    return text;
  }

  get value()
  {
    let res;

    const input_value = this.select.value;
    if (!Utils.isEmpty(input_value))
    {
      res = input_value;
    }

    return res;
  }

  Render()
  {
    this.select = document.createElement("select");
    this.select.id = "ptFilter_" + this.def.id;
    for (const def_option of this.def.options)
    {
      const option = document.createElement("option");
      option.value = def_option.value;
      option.innerText = def_option.text;
      this.select.append(option);
    }

    this.label = document.createElement("label");
    this.label.for = this.select.id;
    this.label.innerText = this.def.label;

    return [this.label, this.select];
  }
}
Filter_Buddy.Select = Select;

class Number
{
  constructor(def)
  {
    this.def = def;
  }

  set value(input_value)
  {
    this.input.value = "";
    if (!Utils.isEmpty(input_value))
    {
      input_value = parseInt(input_value);
      if (isNaN(input_value))
      {
        input_value = 0;
      }
      this.input.value = input_value;
    }
  }

  get value()
  {
    let res;

    const input_value = this.input.value;
    if (!Utils.isEmpty(input_value))
    {
      res = parseInt(input_value);
      if (isNaN(res))
      {
        res = 0;
      }
    }

    return res;
  }

  Render()
  {
    this.input = document.createElement("input");
    this.input.id = "ptFilter_" + this.def.id;
    this.input.type = "number";

    this.label = document.createElement("label");
    this.label.for = this.input.id;
    this.label.innerText = this.def.label;

    return [this.label, this.input];
  }
}
Filter_Buddy.Number = Number;

class Date_Time
{
  constructor(def)
  {
    this.def = def;
  }

  set value(input_value)
  {
    this.input.value = "";
    if (!Utils.isEmpty(input_value))
    {
      this.input.value = input_value;
    }
  }

  get value()
  {
    let res;

    const input_value = this.input.value;
    if (!Utils.isEmpty(input_value))
    {
      res = input_value;
    }

    return res;
  }

  Get_Text(input_value)
  {
    const date = new Date(input_value);
    const res = date.toLocaleString();

    return res;
  }

  Render()
  {
    this.input = document.createElement("input");
    this.input.id = "ptFilter_" + this.def.id;
    this.input.type = "datetime-local";

    this.label = document.createElement("label");
    this.label.for = this.input.id;
    this.label.innerText = this.def.label;

    return [this.label, this.input];
  }
}
Filter_Buddy.Date_Time = Date_Time;

export default Filter_Buddy;