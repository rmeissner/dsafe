import React, { useState } from 'react'
import { grey } from '@mui/material/colors';
import { Group } from '../../styled/tables';
import { Box, styled } from '@mui/system';
import { SwipeableDrawer, Typography } from '@mui/material';


const Sidebar = styled(Group)(({ theme }) => ({
    height: "100vh",
    width: "400px",
    overflowY: "scroll"
}))

const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
}));

export const drawerBleeding = 64

export const ResponsiveSidebar: React.FC<{ isDesktop: boolean, header?: React.ReactNode }> = ({ isDesktop, children, header }) => {
    const [open, setOpen] = useState(true);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    if (!isDesktop) {
        return (<SwipeableDrawer
            id="transaction_drawer"
            anchor="bottom"
            open={open}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
            swipeAreaWidth={drawerBleeding}
            disableSwipeToOpen={false}
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                '& > .MuiPaper-root': {
                    height: `calc(90% - ${drawerBleeding}px)`,
                    overflow: 'visible',
                    },
            }}
        >
            <StyledBox
                sx={{
                    position: 'absolute',
                    top: -drawerBleeding,
                    height: drawerBleeding,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    visibility: 'visible',
                    right: 0,
                    left: 0,
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Puller />
                {header}
            </StyledBox>
            <StyledBox
                sx={{
                    px: 2,
                    pb: 2,
                    height: '100%',
                    overflow: 'auto',
                }}
            >
                {children}
            </StyledBox>
        </SwipeableDrawer>)
    }
    return (<Sidebar>
        {header}
        {children}
    </Sidebar>)
}