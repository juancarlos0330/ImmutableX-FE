import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function PopupDialog(props) {
    const fullWidth = true;
    const maxWidth = 'xs';
    return (
        <div>
            <Dialog
                open={props.open}
                onClose={() => {
                    props.onClose();
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth={fullWidth}
                maxWidth={maxWidth}
            >
                <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">{props.children}</DialogContentText>
                    {props.buttons.map((btn) => {
                        return (
                            <Button fullWidth variant="contained" size='large' style={{margin: '5px 0'}}
                                onClick={() => {
                                    props.onClose();

                                    if (btn.onClick) btn.onClick();
                                }}
                            >
                                {btn.title}
                            </Button>
                        );
                    })}
                </DialogContent>                
            </Dialog>
        </div>
    );
}
