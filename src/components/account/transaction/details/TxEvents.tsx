import React, { ReactElement } from 'react'
import { SafeInteractionEvent, Event } from 'safe-indexer-ts'
import { Entry, Group, Header } from '../../../../styled/tables';
import TxSummary from '../TxSummary';

export interface Props {
    interactions: SafeInteractionEvent[]
}

const eventSummary = (event: Event): ReactElement => {
    return <div>
        {`Event - ${event.eventId}`}<br />
        <br />
    </div>
}

export const TxEvents: React.FC<Props> = ({ interactions }) => {
    if (interactions.length == 0) return <></>
    return <>
        <Header>Events:</Header>
        <Group sx={{ textAlign: "left" }}>
            {interactions.map((e) => (<Entry>
                {e.interaction ? <TxSummary interaction={e.interaction} hideDate /> : eventSummary(e.event)}
            </Entry>))}
        </Group>
    </>
}

export default TxEvents