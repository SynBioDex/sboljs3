
import SBOL2GraphView from '../../SBOL2GraphView'
import SBOLXGraphView from '../../SBOLXGraphView'

import S2ComponentDefinition from '../../sbol2/S2ComponentDefinition'
import SXComponent from '../../sbolx/SXComponent'
import SXRange from '../../sbolx/SXRange'
import SXOrientedLocation from '../../sbolx/SXOrientedLocation'
import SXThingWithLocation from '../../sbolx/SXThingWithLocation'
import S2ModuleDefinition from '../../sbol2/S2ModuleDefinition'
import S2FunctionalComponent from '../../sbol2/S2FunctionalComponent'
import S2SequenceAnnotation from '../../sbol2/S2SequenceAnnotation'
import S2GenericLocation from '../../sbol2/S2GenericLocation'
import S2Experiment from '../../sbol2/S2Experiment'
import S2ExperimentalData from '../../sbol2/S2ExperimentalData'
import SXExperiment from '../../sbolx/SXExperiment'
import SXExperimentalData from '../../sbolx/SXExperimentalData'
import S2Range from '../../sbol2/S2Range'
import SXIdentified from '../../sbolx/SXIdentified'
import S2Identified from '../../sbol2/S2Identified'
import { Graph } from 'rdfoo'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'

import S2IdentifiedFactory from '../../sbol2/S2IdentifiedFactory'
import URIUtils from '../../URIUtils';
import S2Sequence from '../../sbol2/S2Sequence';


export default function convertXto2(graph:Graph) {

    let sbol2View:SBOL2GraphView = new SBOL2GraphView(graph)

    let newGraph = new Graph()
    let sbolxView:SBOLXGraphView = new SBOLXGraphView(newGraph)


    for(let ed of sbolxView.experimentalData) {
        let ed2 = new S2ExperimentalData(sbol2View, ed.uri)
        ed2.setUriProperty(Predicates.a, Types.SBOL2.ExperimentalData)
        copyIdentifiedProperties(ed, ed2)
    }

    for(let ex of sbolxView.experiments) {
        let ex2 = new S2Experiment(sbol2View, ex.uri)
        ex2.setUriProperty(Predicates.a, Types.SBOL2.Experiment)
        copyIdentifiedProperties(ex, ex2)
        for(let ed of ex.experimentalData) {
            ex2.insertUriProperty(Predicates.SBOLX.experimentalData, ed.uri)
        }
    }

    for(let seq of sbolxView.sequences) {
        let seq2 = new S2Sequence(sbol2View, seq.uri)
        seq2.setUriProperty(Predicates.a, Types.SBOL2.Sequence)
        copyIdentifiedProperties(seq, seq2)
        seq2.elements = seq.elements
        seq2.encoding = seq.encoding
    }



    type Mapping = {
        cd: S2ComponentDefinition,
        md: S2ModuleDefinition,
        fc: S2FunctionalComponent,
        cdSuffix:string,
        mdSuffix:string
    }
    
    let componentToCDandMD:Map<string, Mapping> = new Map()
    let subcomponentToFC:Map<string, S2FunctionalComponent> = new Map()

    function getCDandMD(componentURI:string):Mapping|undefined {
        let mapping = componentToCDandMD.get(componentURI)
        if(!mapping) {
            console.warn(componentURI + ' has no cd/md mapping?')
        }
        return mapping
    }

    // Create CDs and MDs for every component, where the MD contains the CD as an FC
    //
    for(let component of sbolxView.components) {

        let cdUri = component.uri
        let mdUri = component.uri

        let cdSuffix = '_component'
        let mdSuffix = '_module'

        // both URIs need to be different, but want to try to keep the old SBOL2 URI for the correct object if we can
        //
        switch(component.getUriProperty('http://biocad.io/terms/backport#prevType')) {
            case Types.SBOL2.ModuleDefinition:
                mdSuffix = ''
                break
            case Types.SBOL2.ComponentDefinition:
            default:
                cdSuffix = ''
                break
        }

        if(cdSuffix !== '')
            cdUri = URIUtils.addSuffix(cdUri, cdSuffix)

        if(mdSuffix !== '')
            mdUri = URIUtils.addSuffix(mdUri, mdSuffix)

        let cd = new S2ComponentDefinition(sbol2View, cdUri)
        cd.setUriProperty(Predicates.a, Types.SBOL2.ComponentDefinition)
        copyIdentifiedProperties(component, cd)
        cd.displayId = component.id + cdSuffix

        let md = new S2ModuleDefinition(sbol2View, mdUri)
        md.setUriProperty(Predicates.a, Types.SBOL2.ModuleDefinition)
        copyIdentifiedProperties(component, md)
        md.displayId = module.id + mdSuffix

        if(md.persistentIdentity && mdSuffix)
            md.persistentIdentity = URIUtils.addSuffix(md.persistentIdentity, mdSuffix)

        if(cd.persistentIdentity && cdSuffix)
            cd.persistentIdentity = URIUtils.addSuffix(cd.persistentIdentity, cdSuffix)

        let fc = md.createFunctionalComponent(cd)

        for(let role of component.roles) {
            cd.addRole(role)
        }

        for(let type of component.types) {
            cd.addType(type)
        }

        for(let seq of component.sequences) {
            cd.insertUriProperty(Predicates.SBOL2.sequence, seq.uri)
        }

        for(let feature of component.sequenceFeatures) {

            let sa = new S2SequenceAnnotation(sbol2View, feature.uri)
            sa.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)
            copyIdentifiedProperties(feature, sa)

            cd.insertUriProperty(Predicates.SBOL2.sequenceAnnotation, sa.uri)

            for(let role of feature.roles) {
                sa.addRole(role)
            }

            copyLocations(sbol2View, feature, sa)
        }

        componentToCDandMD.set(component.uri, { cd, md, fc, mdSuffix, cdSuffix })
    }

    // Make subcomponents into both SBOL2 subcomponents and SBOL2 functionalcomponents
    for(let component of sbolxView.components) {

        let mapping = getCDandMD(component.uri)

        if(!mapping) {
            throw new Error('???')
        }

        let { cd, md, fc } = mapping

        for(let subcomponent of component.subComponents) {

            let defUri = subcomponent.getRequiredUriProperty(Predicates.SBOLX.instanceOf)
            
            let newDefOfSubcomponent = getCDandMD(defUri)

            if(newDefOfSubcomponent === undefined) {
                throw new Error('???')
            }

            let cdSubcomponent = cd.addComponentByDefinition(newDefOfSubcomponent.cd, subcomponent.id, subcomponent.name, subcomponent.version)
            let mdSubcomponent = md.createFunctionalComponent(newDefOfSubcomponent.cd, subcomponent.id,  subcomponent.name, subcomponent.version)

            subcomponentToFC.set(subcomponent.uri, mdSubcomponent)

            if(subcomponent.measure)
                mdSubcomponent.setUriProperty(Predicates.SBOL2.measure, subcomponent.measure.uri)

            copyIdentifiedProperties(subcomponent, cdSubcomponent)
            copyIdentifiedProperties(subcomponent, mdSubcomponent)

            if(subcomponent.sourceLocation) {
                cdSubcomponent.setUriProperty(Predicates.SBOLX.sourceLocation, subcomponent.sourceLocation.uri)
            }

            if(subcomponent.locations.length > 0) {

                // if it has locations it needs a SA

                let saDisplayId = subcomponent.getStringProperty('http://biocad.io/terms/backport#sequenceAnnotationDisplayId')

                if(!saDisplayId) {
                    saDisplayId = subcomponent.id + '_anno'
                }

                let saIdent = S2IdentifiedFactory.createChild(sbol2View, Types.SBOL2.SequenceAnnotation, cd, Predicates.SBOL2.sequenceAnnotation, saDisplayId, subcomponent.version)
                let sa = new S2SequenceAnnotation(sbol2View, saIdent.uri)

                copyLocations(sbol2View, subcomponent, sa)


            }
        }
    }

    // Port interactions
    for(let component of sbolxView.components) {

        let mapping = getCDandMD(component.uri)

        if(!mapping) {
            throw new Error('???')
        }

        let { cd, md, fc, cdSuffix, mdSuffix } = mapping

        for(let interaction of component.interactions) {

            let newInteraction = md.createInteraction(interaction.id, interaction.version)
            copyIdentifiedProperties(interaction, newInteraction)

            if (interaction.measure) {
                newInteraction.setUriProperty(Predicates.SBOL2.measure, interaction.measure.uri)
            }

            for(let participation of interaction.participations) {

                let newParticipation = newInteraction.createParticipation(participation.id, participation.version)
                copyIdentifiedProperties(participation, newParticipation)

                if (participation.measure) {
                    newParticipation.setUriProperty(Predicates.SBOL2.measure, participation.measure.uri)
                }

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


    for(let md of sbol2View.moduleDefinitions) {
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



    // For "generic top levels"

    graph.replaceURI(Predicates.SBOLX.persistentIdentity, Predicates.SBOL2.persistentIdentity)
    graph.replaceURI(Predicates.SBOLX.id, Predicates.SBOL2.displayId)
    graph.replaceURI(Predicates.SBOLX.version, Predicates.SBOL2.version)



    graph.addAll(newGraph)

    function copyIdentifiedProperties(a:SXIdentified, b:S2Identified) {

        let aTriples = graph.match(a.uri, null, null)

        for(let triple of aTriples) {
            
            let p = triple.predicate.nominalValue

            if(p === Predicates.a) {
                continue
            }

            if(p === Predicates.SBOLX.id) {
                b.graph.insert(b.uri, Predicates.SBOL2.displayId, triple.object)
                continue
            }

            if(p === Predicates.SBOLX.persistentIdentity) {
                b.graph.insert(b.uri, Predicates.SBOL2.persistentIdentity, triple.object)
                continue
            }

            if(p === Predicates.SBOLX.version) {
                b.graph.insert(b.uri, Predicates.SBOL2.version, triple.object)
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


    function copyLocations(sbol2View:SBOL2GraphView, oldThing:SXThingWithLocation, newThing:S2SequenceAnnotation) {

        for(let location of oldThing.locations) {
            if(location instanceof SXRange) {

                let newLocIdent = S2IdentifiedFactory.createChild(sbol2View, Types.SBOL2.Range, newThing, Predicates.SBOL2.location, location.id, location.version)
                let newLoc = new S2Range(sbol2View, newLocIdent.uri)

                if(location.sequence) {
                    newLoc.setUriProperty(Predicates.SBOL2.sequence, location.sequence.uri)
                }

                newLoc.start = location.start
                newLoc.end = location.end

                newLoc.orientation = location.orientation === Specifiers.SBOLX.Orientation.ReverseComplement ?
                        Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

            } else if(location instanceof SXOrientedLocation) {

                let newLocIdent = S2IdentifiedFactory.createChild(sbol2View, Types.SBOL2.GenericLocation, newThing, Predicates.SBOL2.location, location.id, location.version)
                let newLoc = new S2GenericLocation(sbol2View, newLocIdent.uri)

                if(location.sequence) {
                    newLoc.setUriProperty(Predicates.SBOL2.sequence, location.sequence.uri)
                }

                newLoc.orientation = location.orientation === Specifiers.SBOLX.Orientation.ReverseComplement ?
                        Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

            } else {
                throw new Error('not implemented location type')
            }
        }
    }


}


