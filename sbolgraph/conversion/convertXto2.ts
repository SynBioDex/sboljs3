
import SBOL2Graph from '../SBOL2Graph'
import SBOLXGraph from '../SBOLXGraph'

import S2ComponentDefinition from '../sbol2/S2ComponentDefinition'
import SXComponent from '../sbolx/SXComponent'
import SXRange from '../sbolx/SXRange'
import SXOrientedLocation from '../sbolx/SXOrientedLocation'
import SXThingWithLocation from '../sbolx/SXThingWithLocation'
import S2ModuleDefinition from '../sbol2/S2ModuleDefinition'
import S2FunctionalComponent from '../sbol2/S2FunctionalComponent'
import S2SequenceAnnotation from '../sbol2/S2SequenceAnnotation'
import S2GenericLocation from '../sbol2/S2GenericLocation'
import S2Range from '../sbol2/S2Range'
import SXIdentified from '../sbolx/SXIdentified'
import S2Identified from '../sbol2/S2Identified'
import Graph from '../Graph'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'

import S2IdentifiedFactory from '../sbol2/S2IdentifiedFactory'
import URIUtils from '../URIUtils';


export default function convertXto2(graph:Graph) {

    let graphx:SBOLXGraph = new SBOLXGraph()
    graphx.graph = graph.graph

    let graph2:SBOL2Graph = new SBOL2Graph()

    type Mapping = { cd: S2ComponentDefinition, md: S2ModuleDefinition, fc: S2FunctionalComponent }
    
    let componentToCDandMD:Map<string, Mapping> = new Map()
    let subcomponentToFC:Map<string, S2FunctionalComponent> = new Map()

    function getCDandMD(component:SXComponent):Mapping|undefined {
        let mapping = componentToCDandMD.get(component.uri)
        if(!mapping) {
            console.warn(component.uri + ' has no cd/md mapping?')
        }
        return mapping
    }

    // Create CDs and MDs for every component, where the MD contains the CD as an FC
    //
    for(let component of graphx.components) {

        let cdUri = component.uri
        let mdUri = component.uri

        // both URIs need to be different, but want to try to keep the old SBOL2 URI for the correct object if we can
        //
        switch(component.getUriProperty('http://biocad.io/terms/backport#prevType')) {
            case Types.SBOL2.ModuleDefinition:
                cdUri = URIUtils.addSuffix(cdUri, '_component')
                break
            case Types.SBOL2.ComponentDefinition:
            default:
                mdUri = URIUtils.addSuffix(mdUri, '_module')
                break
        }

        let cd = new S2ComponentDefinition(graph2, cdUri)
        cd.setUriProperty(Predicates.a, Types.SBOL2.ComponentDefinition)
        copyIdentifiedProperties(component, cd)

        let md = new S2ModuleDefinition(graph2, mdUri)
        md.setUriProperty(Predicates.a, Types.SBOL2.ModuleDefinition)
        copyIdentifiedProperties(component, md)

        let fc = md.createFunctionalComponent(cd)

        for(let role of component.roles) {
            cd.addRole(role)
        }

        for(let type of component.types) {
            cd.addType(type)
        }

        for(let feature of component.sequenceFeatures) {

            let sa = new S2SequenceAnnotation(graph2, feature.uri)
            sa.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)
            copyIdentifiedProperties(feature, sa)

            cd.insertUriProperty(Predicates.SBOL2.sequenceAnnotation, sa.uri)

            for(let role of feature.roles) {
                sa.addRole(role)
            }

            copyLocations(graph2, feature, sa)
        }

        componentToCDandMD.set(component.uri, { cd, md, fc })
    }

    // Make subcomponents into both SBOL2 subcomponents and SBOL2 functionalcomponents
    for(let component of graphx.components) {

        let mapping = getCDandMD(component)

        if(!mapping) {
            throw new Error('???')
        }

        let { cd, md, fc } = mapping

        for(let subcomponent of component.subComponents) {

            let defUri = subcomponent.getRequiredUriProperty(Predicates.SBOLX.instanceOf)
            
            let newDefOfSubcomponent = getCDandMD(defUri)



            let cdSubcomponent = cd.addComponentByDefinition(cd)
            let mdSubcomponent = md.createFunctionalComponent(cd)

            subcomponentToFC.set(subcomponent.uri, mdSubcomponent)

            copyIdentifiedProperties(subcomponent, cdSubcomponent)
            copyIdentifiedProperties(subcomponent, mdSubcomponent)

            if(subcomponent.locations.length > 0) {

                // if it has locations it needs a SA

                let saDisplayId = subcomponent.getStringProperty('http://biocad.io/terms/backport#sequenceAnnotationDisplayId')

                if(!saDisplayId) {
                    saDisplayId = subcomponent.id + '_anno'
                }

                let saIdent = S2IdentifiedFactory.createChild(graph2, Types.SBOL2.SequenceAnnotation, cd, Predicates.SBOL2.sequenceAnnotation, saDisplayId, subcomponent.version)
                let sa = new S2SequenceAnnotation(graph2, saIdent.uri)

                copyLocations(graph2, subcomponent, sa)


            }
        }
    }

    // Port interactions
    for(let component of graphx.components) {

        let { cd, md, fc } = getCDandMD(component)

        for(let interaction of component.interactions) {

            let newInteraction = md.createInteraction(interaction.id, interaction.version)
            copyIdentifiedProperties(interaction, newInteraction)

            for(let participation of interaction.participations) {

                let newParticipation = newInteraction.createParticipation(participation.id, participation.version)
                copyIdentifiedProperties(participation, newParticipation)

                for(let role of participation.roles) {
                    newParticipation.addRole(role)
                }

                let participant = participation.participant

                if(participant) {

                    let newParticipant = subcomponentToFC.get(participant.uri)

                    newParticipation.participant = newParticipant

                }
            }
        }
    }

    // We can do some pruning now.
    //
    //  1) ModuleDefinitions with no interactions and no models are "pointless modules".
    //     They can be deleted along with their submodules and FCs.
    //
    //  TODO: similar rule for pointless CDs as well (no seq, seq annotations?)
    //   & if there is ONLY a module left, remove its _module suffix
    //
    // It's easier to do this on the generated SBOL2 because it means we don't
    // have to make assumptions about how the SBOLX will map to SBOL2.
    //


    for(let md of graph2.moduleDefinitions) {
        if(md.interactions.length === 0 && md.models.length === 0) {
            md.destroy()
        }
    }


    // Delete anything with an SBOLX type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbolx) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }

    graph.graph.addAll(graph2.graph)
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


function copyLocations(graph2:SBOL2Graph, oldThing:SXThingWithLocation, newThing:S2SequenceAnnotation) {

    for(let location of oldThing.locations) {
        if(location instanceof SXRange) {

            let newLocIdent = S2IdentifiedFactory.createChild(graph2, Types.SBOL2.Range, newThing, Predicates.SBOL2.location, location.id, location.version)
            let newLoc = new S2Range(graph2, newLocIdent.uri)

            newLoc.start = location.start
            newLoc.end = location.end

            newLoc.orientation = location.orientation === Specifiers.SBOLX.Orientation.ReverseComplement ?
                    Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

        } else if(location instanceof SXOrientedLocation) {

            let newLocIdent = S2IdentifiedFactory.createChild(graph2, Types.SBOL2.GenericLocation, newThing, Predicates.SBOL2.location, location.id, location.version)
            let newLoc = new S2GenericLocation(graph2, newLocIdent.uri)

            newLoc.orientation = location.orientation === Specifiers.SBOLX.Orientation.ReverseComplement ?
                    Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

        } else {
            throw new Error('not implemented location type')
        }
    }
}



