
import SBOL2Graph from './SBOL2Graph'
import SBOLXGraph from './SBOLXGraph'

import {

    S2ComponentDefinition,
    SXComponent,
    SXRange,
    SXOrientedLocation,
    SXThingWithLocation,
    S2ModuleDefinition,
    S2FunctionalComponent,
    S2SequenceAnnotation,
    S2GenericLocation,
    S2Range,
    SXIdentified,
    S2Identified

} from '.'


import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'

import S2IdentifiedFactory from './sbol2/S2IdentifiedFactory'



export default function convertToSBOL2(graph:SBOLXGraph):SBOL2Graph {

    const newGraph:SBOL2Graph = new SBOL2Graph()

    // Keep anything in the graph that isn't describing an SBOLX object
    // TODO: update references to converted objects
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
        copyIdentifiedProperties(component, cd)

        let md = newGraph.createModuleDefinition(component.uriPrefix, component.id + '_module', component.version)
        copyIdentifiedProperties(component, md)

        let fc = md.createFunctionalComponent(cd)

        for(let role of component.roles) {
            cd.addRole(role)
        }

        for(let type of component.types) {
            cd.addType(type)
        }

        for(let feature of component.sequenceFeatures) {
            let saIdent = S2IdentifiedFactory.createChild(newGraph, Types.SBOL2.SequenceAnnotation, cd, Predicates.SBOL2.sequenceAnnotation, feature.id, feature.version)
            let sa = new S2SequenceAnnotation(newGraph, saIdent.uri)

            for(let role of feature.roles) {
                sa.addRole(role)
            }

            copyLocations(newGraph, feature, sa)
        }

        componentToCDandMD.set(component.uri, { cd, md, fc })
    }

    // Make subcomponents into both SBOL2 subcomponents and SBOL2 functionalcomponents
    for(let component of graph.components) {

        let { cd, md, fc } = getCDandMD(component)

        for(let subcomponent of component.subComponents) {

            let newDefOfSubcomponent = getCDandMD(subcomponent.instanceOf)

            let cdSubcomponent = cd.addComponentByDefinition(newDefOfSubcomponent.cd)
            let mdSubcomponent = md.createFunctionalComponent(newDefOfSubcomponent.cd)

            copyIdentifiedProperties(subcomponent, cdSubcomponent)
            copyIdentifiedProperties(subcomponent, mdSubcomponent)

            if(subcomponent.locations.length > 0) {

                // if it has locations it needs a SA

                let saDisplayId = subcomponent.getStringProperty('http://biocad.io/terms/backport#sequenceAnnotationDisplayId')

                if(!saDisplayId) {
                    saDisplayId = subcomponent.id + '_anno'
                }

                let saIdent = S2IdentifiedFactory.createChild(newGraph, Types.SBOL2.SequenceAnnotation, cd, Predicates.SBOL2.sequenceAnnotation, saDisplayId, subcomponent.version)
                let sa = new S2SequenceAnnotation(newGraph, saIdent.uri)

                copyLocations(newGraph, subcomponent, sa)


            }
        }
    }


    // We can do some pruning now.
    //
    //  1) ModuleDefinitions with no interactions and no models are "pointless modules".
    //     They can be deleted along with their submodules and FCs.
    //
    //  TODO: similar rule for pointless CDs as well (no seq, seq annotations?)
    //
    // It's easier to do this on the generated SBOL2 because it means we don't
    // have to make assumptions about how the SBOLX will map to SBOL2.
    //

    for(let md of newGraph.moduleDefinitions) {
        if(md.interactions.length === 0 && md.models.length === 0) {
            md.destroy()
        }
    }




    return newGraph
}

function copyIdentifiedProperties(a:SXIdentified, b:S2Identified) {

    let aTriples = a.graph.match(a.uri, null, null)

    for(let triple of aTriples) {
        
        let p = triple.predicate.nominalValue

        if(p === Predicates.a) {
            continue
        }

        if(p.indexOf('http://biocad.io/terms/backport#') !== -1) {
            continue
        }

        if(p.indexOf(Prefixes.sbolx) !== 0) {
            b.graph.insert(b.uri, triple.predicate.nominalValue, triple.object)
        }
    }
}


function copyLocations(newGraph:SBOL2Graph, oldThing:SXThingWithLocation, newThing:S2SequenceAnnotation) {

    for(let location of oldThing.locations) {
        if(location instanceof SXRange) {

            let newLocIdent = S2IdentifiedFactory.createChild(newGraph, Types.SBOL2.Range, newThing, Predicates.SBOL2.location, location.id, location.version)
            let newLoc = new S2Range(newGraph, newLocIdent.uri)

            newLoc.start = location.start
            newLoc.end = location.end

            newLoc.orientation = location.orientation === Specifiers.SBOLX.Orientation.ReverseComplement ?
                    Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

        } else if(location instanceof SXOrientedLocation) {

            let newLocIdent = S2IdentifiedFactory.createChild(newGraph, Types.SBOL2.GenericLocation, newThing, Predicates.SBOL2.location, location.id, location.version)
            let newLoc = new S2GenericLocation(newGraph, newLocIdent.uri)

            newLoc.orientation = location.orientation === Specifiers.SBOLX.Orientation.ReverseComplement ?
                    Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

        } else {
            throw new Error('not implemented location type')
        }
    }
}



