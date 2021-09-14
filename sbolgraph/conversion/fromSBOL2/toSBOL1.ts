import { Graph, node } from "rdfoo";
import { SBOL2GraphView, SBOL1GraphView, S2Identified, S2Range, S2OrientedLocation } from "../..";
import { Predicates, Types, Specifiers, Prefixes } from "bioterms";

export default function convert2to1(graph:Graph) {

    let sbol2View:SBOL2GraphView = new SBOL2GraphView(graph)

    let newGraph:Graph = new Graph()
    let sbol1View:SBOL1GraphView = new SBOL1GraphView(newGraph)

    for(let cd of sbol2View.componentDefinitions) {

        if(cd.type !== Specifiers.SBOL2.Type.DNA) {
            continue
        }

        newGraph.insertProperties(cd.subject, {
            [Predicates.a]: node.createUriNode(Types.SBOL1.DnaComponent)
        })

        copyIdentifiedProperties(cd)

        for(let role of cd.roles) {
            newGraph.insertProperties(cd.subject, {
                [Predicates.a]: node.createUriNode(role)
            })
        }

        if(cd.hasProperty(Predicates.SBOL2.sequence)) {
            newGraph.insertProperties(cd.subject, {
                [Predicates.SBOL1.dnaSequence]: cd.sequences[0]?.subject
            })
        }

        for(let sa of cd.sequenceAnnotations) {

            newGraph.insertProperties(sa.subject, {
                [Predicates.a]: node.createUriNode(Types.SBOL1.SequenceAnnotation)
            })

            newGraph.insertProperties(cd.subject, {
                [Predicates.SBOL1.annotation]: sa.subject
            })

            copyIdentifiedProperties(sa)

            for(let location of sa.locations) {

                if(location instanceof S2Range) {

                    if(location.hasProperty(Predicates.SBOL2.start)) {
                        newGraph.insertProperties(sa.subject, {
                            [Predicates.SBOL1.bioStart]: node.createIntNode(location.start as number)
                        })
                    }

                    if(location.hasProperty(Predicates.SBOL2.end)) {
                        newGraph.insertProperties(sa.subject, {
                            [Predicates.SBOL1.bioEnd]: node.createIntNode(location.end as number)
                        })
                    }

                    break
                }
            }

            for(let location of sa.locations) {
                if(location instanceof S2OrientedLocation) {
                    if(location.hasProperty(Predicates.SBOL2.orientation)) {
                        newGraph.insertProperties(sa.subject, {
                            [Predicates.SBOL1.strand]: 
                                    node.createStringNode(location.orientation === Specifiers.SBOL2.Orientation.ReverseComplement ? '-' : '+')
                        })
                    }
                }
            }

            if (sa.hasProperty(Predicates.SBOL2.component)) {
                newGraph.insertProperties(sa.subject, {
                    [Predicates.SBOL1.subComponent]: sa.component!.definition.subject
                })
            }


        }

        for(let c of cd.components) {

            // if already referenced by an SA, don't duplicate
            //
            if(c.sequenceAnnotations.length > 0) {
                continue
            }

            newGraph.insertProperties(c.subject, {
                [Predicates.a]: node.createUriNode(Types.SBOL1.SequenceAnnotation)
            })

            cd.insertProperty(Predicates.SBOL1.annotation, c.subject)

            copyIdentifiedProperties(c)

            newGraph.insertProperties(c.subject, {
                [Predicates.SBOL1.subComponent]: c.definition.subject
            })

        }

        for(let sc of cd.sequenceConstraints) {
            if(sc.restriction === Specifiers.SBOL2.SequenceConstraint.Precedes) {

                let subjSA = sc.subject.sequenceAnnotations.length > 0 ? sc.subject.sequenceAnnotations[0] : sc.subject
                let objSA = sc.object.sequenceAnnotations.length > 0 ? sc.object.sequenceAnnotations[0] : sc.object

                newGraph.insertProperties(subjSA.subject, {
                    [Predicates.SBOL1.precedes]: objSA.subject
                })

            }
        }
    }

    for(let coll of sbol2View.collections) {

        newGraph.insertProperties(coll.subject, {
            [Predicates.a]: node.createUriNode(Types.SBOL1.Collection)
        })

        copyIdentifiedProperties(coll)

        for(let member of coll.members) {
            newGraph.insertProperties(coll.subject, {
                [Predicates.SBOL1.component]: member.subject
            })
        }
    }

    for(let seq of sbol2View.sequences) {

        if(seq.encoding !== Specifiers.SBOL2.SequenceEncoding.NucleicAcid)
            continue

        newGraph.insertProperties(seq.subject, {
            [Predicates.a]: node.createUriNode(Types.SBOL1.DnaSequence)
        })

        copyIdentifiedProperties(seq)

        if(seq.hasProperty(Predicates.SBOL2.elements)) {
            newGraph.insertProperties(seq.subject, {
                [Predicates.SBOL1.nucleotides]: node.createStringNode(seq.elements as string)
            })
        }
    }


    // Delete anything with an SBOL2 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbol2) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }


    graph.addAll(newGraph)


    function copyIdentifiedProperties(identified:S2Identified) {

        if(identified.hasProperty('http://sboltools.org/backport#sbol1displayId')) {
            newGraph.insertProperties(identified.subject, {
                [Predicates.SBOL1.displayId]: node.createStringNode(identified.getStringProperty('http://sboltools.org/backport#sbol1displayId') as string)
            })
        } else {
            if(identified.hasProperty(Predicates.SBOL2.displayId)) {
                newGraph.insertProperties(identified.subject, {
                    [Predicates.SBOL1.displayId]: node.createStringNode(identified.displayId as string)
                })
            }
        }

        if(identified.hasProperty(Predicates.Dcterms.title)) {
            newGraph.insertProperties(identified.subject, {
                [Predicates.SBOL1.name]: node.createStringNode(identified.name as string)
            })
        }

        if(identified.hasProperty(Predicates.Dcterms.description)) {
            newGraph.insertProperties(identified.subject, {
                [Predicates.SBOL1.description]: node.createStringNode(identified.description as string)
            })
        }
    }
}

