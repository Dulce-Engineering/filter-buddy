import Utils from "./Utils.mjs";

class Filter_Buddy extends HTMLElement 
{
  static tname = "filter-buddy";

  // lifecycle ====================================================================================

  constructor() 
  {
    super();

    this.setAttribute("view", "min");
    this.filter_svg = `
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
    this.refresh_svg = `
      <svg width="23" height="23" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle style="fill:#A82FA1" cx="16" cy="16" r="14"/>
        <path style="fill:#ffffff" d="m 16.0179,7.0002286 c 1.8938,0.004 3.8141,0.59437 5.3141,1.7626 1.0545,1.2148 -0.95476,2.5158004 -1.8597,1.3312004 -2.7242,-1.6483004 -6.5662,-1.0680004 -8.6158,1.3964 -1.0905,1.223 -1.7049,2.8549 -1.6977,4.4932 l 1.8003,0 c -0.96,1.440998 -1.9202,2.880998 -2.8803,4.320998 -0.9602,-1.44 -1.9203,-2.88 -2.8805,-4.319998 l 1.8003,0 c -0.0573,-3.912 2.756,-7.6331004 6.5325,-8.6462004 0.811,-0.2221 1.646,-0.3465 2.487,-0.3378 z m 7.9033,4.6808004 c 0.96016,1.4402 1.9203,2.8805 2.8805,4.320697 l -1.8003,0 c 0.051,3.958501 -2.8341,7.721301 -6.6772,8.681001 -2.5933,0.72418 -5.5256,0.19575 -7.657,-1.4611 -1.0874,-1.235 0.94976,-2.5235 1.8631,-1.3282 2.6394,1.6014 6.3356,1.0935 8.419,-1.1937 1.2066,-1.2432 1.901,-2.9653 1.8917,-4.698001 l -1.8003,0 c 0.96016,-1.440197 1.9203,-2.880497 2.8805,-4.320697 z"/>
      </svg>
    `;

    this.search_btn_html = this.refresh_svg;
    this.delete_btn_html = "✕";
    this.min_add_btn_html = "+ Add Filter";
    this.mid_add_btn_html = "+ Add Filter";

    this.OnClick_Switch_View_Btn = this.OnClick_Switch_View_Btn.bind(this);
    this.OnClick_Set_View = this.OnClick_Set_View.bind(this);
    this.OnClick_Min_Add_Filter_Btn = this.OnClick_Min_Add_Filter_Btn.bind(this);
    this.OnClick_Mid_Add_Filter_Btn = this.OnClick_Mid_Add_Filter_Btn.bind(this);
    this.OnClick_Search_Btn = this.OnClick_Search_Btn.bind(this);
    this.OnClick_Del_Filter_Btn = this.OnClick_Del_Filter_Btn.bind(this);
    this.OnClick_Max_Clear_Btn = this.OnClick_Max_Clear_Btn.bind(this);
    this.OnClick_Max_Cancel_Btn = this.OnClick_Max_Cancel_Btn.bind(this);
    this.Do_Search = this.Do_Search.bind(this);
  }

  connectedCallback()
  {
    this.Render();
  }

  // fields =======================================================================================

  // input types: text, time, time_range, date, date_range, timestamp, timestamp_range,
  // boolean, one_off, integer, integer_range, float, float_range, currency, currency_range
  // auto_complete
  
  set filters(filter_defs)
  {
    this.filter_defs = this.Copy_Defs(filter_defs);
    this.Render_View(this.mid_filter_defs, "mid_filters_div", "mid");
    this.Render_View(this.filter_defs, "max_filters_div", "max");
    this.Show_View();
  }

  set view(view_name)
  {
    this.Get_View_Data();
    this.Show_View_With_Data(view_name);
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
    else if (this.max_view_div.open)
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

  set srch_btn_html(html)
  {
    this.search_btn_html = html;
    this.min_search_btn.innerHTML = this.html;
    this.mid_search_btn.innerHTML = this.html;
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
    this.show_cancel_btn = true;
    this.view = "max";
  }

  OnClick_Mid_Add_Filter_Btn()
  {
    this.return_view = "mid";
    this.show_cancel_btn = true;
    this.view = "max";
  }

  OnClick_Search_Btn()
  {
    this.Do_Search();

    if (this.return_view)
    {
      this.view = this.return_view;
      this.return_view = null;
    }
  }

  OnClick_Del_Filter_Btn(def)
  {
    def.value = null;
    this.Render_Update_Summ();
    this.Do_Search();
  }

  OnClick_Max_Clear_Btn()
  {
    if (!Utils.Is_Empty(this.filter_defs))
    {
      for (const def of this.filter_defs)
      {
        def.value = null;
      }
    }
    this.Set_View_Data();
  }

  OnClick_Max_Cancel_Btn()
  {
    if (this.return_view)
    {
      this.Show_View_With_Data(this.return_view);
      this.return_view = null;
    }
  }

  // misc =========================================================================================

  Do_Search()
  {
    this.Get_View_Data();
    const filter_data = this.Get_Data();
    const search_event = new CustomEvent("search", {detail: filter_data});
    this.dispatchEvent(search_event);
  }

  Copy_Defs(defs)
  {
    let res;

    if (!Utils.Is_Empty(defs))
    {
      res = [];
      for (const def of defs)
      {
        const new_def = {...def};
        res.push(new_def);
      }
    }

    return res;
  }

  Has_Filter_Values()
  {
    let res = false;

    if (!Utils.Is_Empty(this.filter_defs))
    {
      res = this.filter_defs.some(def => def.value != null);
    }

    return res;
  }

  Has_Filters()
  {
    let res = false;

    if (!Utils.Is_Empty(this.filter_defs))
    {
      res = this.filter_defs.some(def => Utils.Has_Value(def.filter_class));
    }

    return res;
  }

  Has_Max_Filters()
  {
    let res = false;

    if (!Utils.Is_Empty(this.filter_defs))
    {
      res = this.filter_defs.some(def => def.in_mid_view != true);
    }

    return res;
  }

  Get_View_Data()
  {
    const view = this.view;

    const defs = this.Get_Current_Defs();
    if (!Utils.Is_Empty(defs))
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
    if (!Utils.Is_Empty(defs))
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
    let res;

    if (!Utils.Is_Empty(this.filter_defs))
    {
      res = {};
      for (const def of this.filter_defs)
      {
        if (def.value != null)
        {
          res[def.id] = def.value;
        }
      }
    }

    return Utils.nullIfEmpty(res);
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

  Get_Elem_By_Id(id)
  {
    return this.querySelector("[cid="+id+"]");
  }

  // rendering ====================================================================================

  Show_View_With_Data(view_name)
  {
    this.Show_View(view_name);
    this.Set_View_Data();

    this.Render_Update_Summ();
  }

  Show_View(view_name)
  {
    if (view_name)
    {
      this.min_view_div.hidden = true;
      this.mid_view_div.hidden = true;
      this.max_view_div.close();

      if (view_name == "max")
      {
        this.max_view_div.showModal();
      }
      else
      {
        this[view_name + "_view_div"].hidden = false;
      }
    }
    else
    {
      view_name = this.view;
    }

    if (view_name == "min")
    {
      Utils.Hide_Elem_If(this.min_view_div, "min_add_filter_btn", () => !this.Has_Filters());
      Utils.Hide_Elem_If(this.min_view_div, "min_search_btn", () => !this.Has_Filter_Values());
    }
    else if (view_name == "mid")
    {
      Utils.Hide_Elem_If(this.mid_view_div, "mid_add_filter_btn", () => !this.Has_Max_Filters());
      //Utils.Hide_Elem_If(this, "mid_search_btn", () => !this.Has_Filter_Values());
    }
    else if (view_name == "max")
    {
      Utils.Hide_Elem_If(this.max_view_div, "max_clear_btn", () => !this.Has_Filters());
      Utils.Hide_Elem_If(this.max_view_div, "max_search_btn", () => !this.Has_Filters());
      Utils.Hide_Elem_If(this.max_view_div, "max_cancel_btn", () => !this.show_cancel_btn);
    }
  }

  Render_Update_Summ()
  {
    const view = this.view;
    const summ_div = this.Get_Elem_By_Id(view + "_summ_div");
    if (summ_div)
    {
      const summary_elems = [];

      let defs = this.filter_defs;
      if (!Utils.Is_Empty(defs))
      {
        if (view == "mid")
        {
          defs = defs.filter(d => !d.in_mid_view);
        }
      }

      if (!Utils.Is_Empty(defs))
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
      delete_btn.innerHTML = this.delete_btn_html;

      span = document.createElement("li");
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
    if (!Utils.Is_Empty(filter_defs))
    {
      const elems = [];
      for (const filter_def of filter_defs)
      {
        const filter = new filter_def.filter_class(filter_def, this);
        filter_def[view + "_filter"] = filter;

        const filter_elem = document.createElement("li");
        filter_elem.classList.add("filter_item");
        filter_elem.append(...filter.Render());

        elems.push(filter_elem);
      }
      
      const filters_div = this.Get_Elem_By_Id(filters_div_id);
      filters_div.replaceChildren(...elems.flat());
    }
  }

  Render_Filter_Status()
  {

  }

  Render()
  {
    const html = `
      <!--button cid="switch_view_btn">view</button>
      <span cid="switch_view_list_placeholder"></span-->

      <span cid="min_view_div" hidden>
        <button cid="min_add_filter_btn" class="fb_filter_btn">
          <span class="fb_filter_btn_label">${this.min_add_btn_html}</span>
          </button>
        <ul cid="min_summ_div"></ul><button cid="min_search_btn">
          <span class="search_btn_label">${this.search_btn_html}</span>
        </button>
      </span>

      <span cid="mid_view_div" hidden>
        <span cid="mid_filters_div"></span>
        <span cid="mid_btn_span">
          <button cid="mid_add_filter_btn" class="fb_filter_btn">${this.mid_add_btn_html}</button>
          <button cid="mid_search_btn">${this.search_btn_html}</button>
        </span>
        <div cid="mid_summ_div"></div>
      </span>

      <dialog cid="max_view_div">
        <div class="dialog_header">
          <button cid="max_cancel_btn" class="btn close_btn">
            <span class="cancel_btn_label">✕</span>
          </button> 
          Filters
        </div>

        <div cid="max_view_body" class="dialog_body">
          <ul cid="max_filters_div" class="filter_list"></ul>
        </div>

        <div cid="max_btn_div" class="dialog_footer">
          <button cid="max_clear_btn">Clear</button>
          <button cid="max_search_btn">Search</button>
        </div>
      </dialog>
    `;
    this.innerHTML = html;
    Utils.Set_Id_Shortcuts(this, this, "cid");

    this.min_search_btn.addEventListener("click", this.OnClick_Search_Btn);
    this.mid_search_btn.addEventListener("click", this.OnClick_Search_Btn);
    this.max_search_btn.addEventListener("click", this.OnClick_Search_Btn);

    this.min_add_filter_btn.addEventListener("click", this.OnClick_Min_Add_Filter_Btn);
    this.mid_add_filter_btn.addEventListener("click", this.OnClick_Mid_Add_Filter_Btn);

    this.max_clear_btn.addEventListener("click", this.OnClick_Max_Clear_Btn);
    this.max_cancel_btn.addEventListener("click", this.OnClick_Max_Cancel_Btn);
    
    this.view = this.getAttribute("view");
  }
}

class Text
{
  constructor(def, ctx)
  {
    this.def = def;
    this.ctx = ctx;
  }

  set value(input_value)
  {
    this.input.value = "";
    if (!Utils.Is_Empty(input_value))
    {
      this.input.value = input_value;
    }
  }

  get value()
  {
    let res;

    const input_value = this.input.value;
    if (!Utils.Is_Empty(input_value))
    {
      res = input_value;
    }

    return res;
  }

  Render_Input(def)
  {
    const input = document.createElement("input");
    input.id = "ptFilter_" + def.id;
    input.placeholder = def.placeholder || "";

    return input;
  }

  Render_Label(def, input)
  {
    const label = document.createElement("label");
    label.for = input.id;
    label.innerText = def.label;

    return label;
  }

  Render()
  {
    this.input = this.Render_Input(this.def);
    this.label = this.Render_Label(this.def, this.input);

    if (this.def.auto_search)
    {
      this.input.addEventListener("change", this.ctx.Do_Search);
    }

    return [this.label, this.input];
  }
}
Filter_Buddy.Text = Text;

class Select
{
  constructor(def, ctx)
  {
    this.def = def;
    this.ctx = ctx;
  }

  set value(input_value)
  {
    this.select.value = "";
    if (!Utils.Is_Empty(input_value))
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
    if (!Utils.Is_Empty(input_value))
    {
      res = input_value;
    }

    return res;
  }

  Render_Select(def)
  {
    const select = document.createElement("select");
    select.id = "ptFilter_" + def.id;

    return select;
  }

  Render_Options(def, select)
  {
    if (def.options)
  {
      for (const def_option of def.options)
    {
      const option = document.createElement("option");
      option.value = def_option.value;
      option.innerText = def_option.text;
        select.append(option);
    }
    }
  }

  Render_Label(def, select)
  {
    const label = document.createElement("label");
    label.for = select.id;
    label.innerText = def.label;

    return label;
  }

  Render()
  {
    this.select = this.Render_Select(this.def);
    this.Render_Options(this.def, this.select);
    this.label = this.Render_Label(this.def, this.select);
    this.select.value = null;

    if (this.def.auto_search)
    {
      this.select.addEventListener("change", this.ctx.Do_Search);
    }

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
    if (!Utils.Is_Empty(input_value))
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
    if (!Utils.Is_Empty(input_value))
    {
      res = parseInt(input_value);
      if (isNaN(res))
      {
        res = 0;
      }
    }

    return res;
  }

  Render_Input(def)
  {
    const input = document.createElement("input");
    input.id = "ptFilter_" + def.id;
    input.type = "number";

    return input;
  }

  Render_Label(def, input)
  {
    const label = document.createElement("label");
    label.for = input.id;
    label.innerText = def.label;

    return label;
  }

  Render()
  {
    this.input = this.Render_Input(this.def);
    this.label = this.Render_Label(this.def, this.input);

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
    if (!Utils.Is_Empty(input_value))
    {
      this.input.value = input_value;
    }
  }

  get value()
  {
    let res;

    const input_value = this.input.value;
    if (!Utils.Is_Empty(input_value))
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

Utils.Register_Element(Filter_Buddy);

export default Filter_Buddy;
