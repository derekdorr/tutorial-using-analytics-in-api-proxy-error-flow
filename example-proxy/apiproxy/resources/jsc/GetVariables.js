try {
	var foo = good.indexO('a');
} catch (e) {
	context.setVariable("debug.e",JSON.stringify(e));
  	throw e;
}
