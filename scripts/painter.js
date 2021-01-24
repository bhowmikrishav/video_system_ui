const Painter = {
    full_html_text_replace : function (root_node, replaces = {}) {
        const dom = root_node.childNodes
        dom.forEach((node)=>{
            if(node instanceof Text){
                for (const _replace in replaces) {
                    node.data = node.data.replace(new RegExp(`{{${_replace}}}`, 'g'), replaces[_replace])
                }
            }
            else{
                this.full_html_text_replace(node, replaces)
            }
        })
    }
}

export {Painter}