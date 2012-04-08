var tb_template = function(locals){ var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<a');
buf.push(' href="#" class="imgfoo"')
buf.push('><img');
buf.push(attrs({ 'src':(img.src), "class": ('thumbnail') + ' ' + ('thumbnail-small') }));
buf.push('/>');
if ((banned))
{
buf.push('<i');
buf.push(' class="select icon-ban-circle"')
buf.push('></i>');
}
else
{
buf.push('<i');
buf.push(' class="select icon-ok"')
buf.push('></i>');
}
if ((locals.link))
{
buf.push('<span>' + escape((interp = link.text || link.href) == null ? '' : interp) + '</span>');
}
else
{
buf.push('<span>' + escape((interp = img.width) == null ? '' : interp) + ' x ' + escape((interp = img.height) == null ? '' : interp) + '</span>');
}
buf.push('</a>');
}
return buf.join("");}
