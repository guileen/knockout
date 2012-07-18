var stage_template = function(locals){ var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(' class="imgko-container"')
buf.push('><!-- #myModal.modal.fade.hide--><!--   .modal-header--><!--     h1 ffff--><!--     a.close(data-dismiss=\'modal\')x--><!--   .modal-body--><!--     p on fine body--><!--   .modal-footer--><!--     a.btn.btn-primary 采集--><div');
buf.push(' id="imgko-main-dialog" class="modal hide fade"')
buf.push('><div');
buf.push(' class="modal-header"')
buf.push('><div');
buf.push(' data-dismiss="modal" class="close"')
buf.push('>&times;</div><h3>采集图片</h3><div');
buf.push(' class="btn-group"')
buf.push('><a');
buf.push(' class="btn dropdown"')
buf.push('>全选</a><a');
buf.push(' class="btn"')
buf.push('>全不选</a></div></div><div');
buf.push(' class="modal-body"')
buf.push('><h4>本页图片</h4><div');
buf.push(' class="imgs-stage"')
buf.push('></div><hr');
buf.push('')
buf.push('/><h4>链接</h4><div');
buf.push(' class="links-stage"')
buf.push('></div><!-- h4 Text in a modal--><!-- p Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem.--><!-- <hr>--><!-- h4 Overflowing text to show optional scrollbar--><!-- p We set a fixed <code>max-height</code> on the <code>.modal-body</code>. Watch it overflow with all this extra lorem ipsum text we\'ve included.--></div><div');
buf.push(' class="modal-footer"')
buf.push('><div');
buf.push(' class="row"')
buf.push('><label>nextPage</label><input');
buf.push(' name="nextlink" value=" + (nextLink) + "')
buf.push('/></div><!-- form--><div');
buf.push(' class="row"')
buf.push('><textarea');
buf.push(' name="description" class="description"')
buf.push('>' + escape((interp = title) == null ? '' : interp) + '</textarea></div><div');
buf.push(' class="btn-toolbar"')
buf.push('><div');
buf.push(' class="btn-group"')
buf.push('><a');
buf.push(' href="#" data-dismiss="modal" class="btn btn-danger"')
buf.push('>Close</a></div><div');
buf.push(' class="btn-group"')
buf.push('><a');
buf.push(' href="#" data-dismiss="modal" class="submit btn btn-primary"')
buf.push('>Save changes</a></div></div></div></div></div>');
}
return buf.join("");}
