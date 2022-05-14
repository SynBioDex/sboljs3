

import SBOL3GraphView from '../SBOL3GraphView';
import SBOLFacade from '../SBOLFacade';
import { Node } from 'rdfoo'

export default abstract class S3Facade extends SBOLFacade {

    view:SBOL3GraphView

    constructor(view:SBOL3GraphView, subject:Node) {
        super(view.graph, view, subject)
        this.view = view
    }


}
