-- splice.lua  —  shortcode handler for quarto-splice v1.0.0
-- Usage:  {{< splice "file.html" >}}
-- Optional kwargs: width="100%" height="600" id="my-id"

local counter = 0
local controller_injected = false

local function get_kwarg(kwargs, key, default)
  if kwargs[key] then
    local val = pandoc.utils.stringify(kwargs[key])
    if val ~= "" then return val end
  end
  return default
end

local function splice(args, kwargs, meta)

  if not controller_injected then
    quarto.doc.add_html_dependency({
      name    = "quarto-splice-controller",
      version = "1.0.0",
      scripts = { { path = "secondary-reveal.js" } }
    })
    controller_injected = true
  end

  counter = counter + 1

  local src    = pandoc.utils.stringify(args[1] or pandoc.Str(""))
  local width  = get_kwarg(kwargs, "width",  "100%")
  local height = get_kwarg(kwargs, "height", "600")
  local id     = get_kwarg(kwargs, "id",     "splice-secondary-" .. counter)

  local html = string.format(
    '<iframe id="%s" class="splice-secondary" data-splice-src="%s" ' ..
    'width="%s" height="%s" ' ..
    'style="pointer-events: none;"></iframe>',
    id, src, width, height)

  return pandoc.RawBlock("html", html)
end

return {
  ["splice"] = splice
}
