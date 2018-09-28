
import SBOL2Graph from './SBOL2Graph'
import SBOLXGraph from './SBOLXGraph'

import {

    S2ComponentDefinition,
    SXComponent,
    S2ModuleDefinition,
    S2FunctionalComponent,

} from '.'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'



export default function convertToSBOL2(graph:SBOLXGraph):SBOL2Graph {

    const newGraph:SBOL2Graph = new SBOL2Graph()

    // Keep anything in the graph that isn't describing an SBOLX object
    //
    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbolx) !== 0) {
            for(let triple of graph.match(typeTriple.subject, null, null)) {
                newGraph.add(triple.subject, triple.predicate, triple.object)
            }
        }
    }


    let componentToCDandMD:Map<string, { cd:S2ComponentDefinition, md:S2ModuleDefinition, fc:S2FunctionalComponent }> = new Map()

    function getCDandMD(component:SXComponent) {
        let mapping = componentToCDandMD.get(component.uri)
        if(!mapping) {
            throw new Error('no idea')
        }
        return mapping
    }

    // Create CDs and MDs for every component, where the MD contains the CD as an FC
    //
    for(let component of graph.components) {

        let cd = newGraph.createComponentDefinition(component.uriPrefix, component.id, component.version)
        let md = newGraph.createModuleDefinition(component.uriPrefix, component.id + '_module', component.version)
        let fc = md.createFunctionalComponent(cd)

        componentToCDandMD.set(component.uri, { cd, md, fc })
    }

    // Make subcomponents into both SBOL2 subcomponents and SBOL2 functionalcomponents
    for(let component of graph.components) {

        let { cd, md, fc } = getCDandMD(component)

        for(let subcomponent of component.subComponents) {

            let newDefOfSubcomponent = getCDandMD(subcomponent.instanceOf)

            let cdSubcomponent = cd.addComponentByDefinition(newDefOfSubcomponent.cd)
            let mdSubcomponent = md.createFunctionalComponent(newDefOfSubcomponent.cd)
        }
    }

    return newGraph
}

