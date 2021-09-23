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
    const filter_data = this.Get_View_Data();
    this.Show_View(view_name);
    this.Set_View_Data(filter_data);

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

      for (const def of defs)
      {
        const summary_elem = this.Render_Summary_Elem(def);
        if (summary_elem)
        {
          summary_elems.push(summary_elem);
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
      delete_btn.innerText = "Delete";

      span = document.createElement("span");
      span.innerText = def.label + " = " + value;
      span.style.border = "1px solid red";
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
    const html = `
      <button id="switchViewBtn">view</button>
      <span id="switchViewListPlaceholder"></span>
      <button id="search_btn">Search</button>

      <div id="min_view_div">
        <button id="min_add_filter_btn">+</button>
        <div id="min_summ_div"></div>
      </div>

      <div id="mid_view_div">
        <button id="mid_add_filter_btn">+</button>
        <div id="mid_filters_div"></div>
        <div id="mid_summ_div"></div>
      </div>

      <div id="max_view_div">
        <div id="max_filters_div"></div>
      </div>
    `;
    const doc = Utils.toDocument(html);

    const search_btn = doc.getElementById("search_btn");
    search_btn.addEventListener("click", this.OnClick_Search_Btn);

    const min_add_filter_btn = doc.getElementById("min_add_filter_btn");
    min_add_filter_btn.addEventListener("click", this.OnClick_Min_Add_Filter_Btn);
    const mid_add_filter_btn = doc.getElementById("mid_add_filter_btn");
    mid_add_filter_btn.addEventListener("click", this.OnClick_Mid_Add_Filter_Btn);

    this.min_view_div = doc.getElementById("min_view_div");
    this.mid_view_div = doc.getElementById("mid_view_div");
    this.max_view_div = doc.getElementById("max_view_div");
    this.view = "min";

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
Filter_Buddy.Select = Select;

export default Filter_Buddy;