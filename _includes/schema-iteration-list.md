{% assign schema_files = site.static_files | where: "extname", "" | sort: "path" | reverse %}
{% assign last_version = "" %}
{% assign last_kind = "" %}
{%- for file in schema_files -%}
{%- assign segments = file.path | split: "/" -%}
{%- if segments[1] == include.specification -%}
{%- if segments[2] != last_version -%}
{% assign last_version = segments[2] %}
{% assign last_kind = "" %}
* **v{{ last_version }}**
{%- endif -%}
{%- if segments[3] != last_kind -%}
{%- if segments[4] == "base" -%}
{%- continue -%}
{%- endif -%}
{% assign last_kind = segments[3] %}
  * view [**{{ last_kind }}/{{ segments[4] }}**]({{ site.baseurl }}/{{ include.specification }}/{{ last_version }}/{{ last_kind }}/{{ segments[4] }}.html)  
    download iteration
{%- assign separator = ": " -%}
{%- endif -%}
{{ separator }} [{{ file.basename | replace: "-", "&#8209;" }}]({{ site.baseurl }}{{ file.path }})
{%- assign separator = ", " -%}
{%- endif -%}
{%- endfor -%}
