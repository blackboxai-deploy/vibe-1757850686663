import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const AssetManagerDashboard = () => {
  const { meetings } = useAppContext();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLTI, setSelectedLTI] = useState(null);
  const [agendaDialogOpen, setAgendaDialogOpen] = useState(false);

  // Calculate LTI age in days from planned start date
  const calculateLTIAge = (plannedStartDate) => {
    if (!plannedStartDate) return { days: 0, display: 'Unknown', isSixMonthsPlus: false };
    
    try {
      const startDate = new Date(plannedStartDate);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isSixMonthsPlus = diffDays >= 183; // 6 months = ~183 days
      
      let display = '';
      if (diffDays < 30) {
        display = `${diffDays} days`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        display = `${months} months`;
      } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        display = `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} months` : ''}`;
      }
      
      return { days: diffDays, display, isSixMonthsPlus };
    } catch (error) {
      return { days: 0, display: 'Invalid Date', isSixMonthsPlus: false };
    }
  };

   // Process all LTI data from ALL available sources with debugging
  const processedLTIData = useMemo(() => {
    const allLTIs = [];
    let dataSourceInfo = 'No data source identified';
    
    console.log('🔍 Asset Manager Dashboard - Data Detection Started');
    console.log('📊 Meetings from context:', meetings.length);
    
    try {
      // Strategy 1: Check React Context meetings
      if (meetings && meetings.length > 0) {
        console.log('✅ Checking React Context meetings...');
        meetings.forEach((meeting, index) => {
          console.log(`📋 Meeting ${index + 1}:`, Object.keys(meeting));
          
          if (meeting.isolations && meeting.responses) {
            console.log(`  - Found ${meeting.isolations.length} isolations, ${Object.keys(meeting.responses).length} responses`);
            
            meeting.isolations.forEach(isolation => {
              const response = meeting.responses[isolation.id] || {};
              const plannedStartDate = isolation['Planned Start Date'] || isolation.plannedStartDate;
              
              if (plannedStartDate) {
                const ageInfo = calculateLTIAge(plannedStartDate);
                console.log(`  - LTI ${isolation.id}: ${ageInfo.display}, 6+ months: ${ageInfo.isSixMonthsPlus}`);
                
                allLTIs.push({
                  id: isolation.id,
                  description: isolation.description || isolation.Title || 'No description',
                  plannedStartDate: plannedStartDate,
                  ageInfo: ageInfo,
                  meetingDate: meeting.date,
                  source: 'React Context',
                  riskLevel: response.riskLevel || 'N/A',
                  businessImpact: response.businessImpact || 'N/A',
                  mocRequired: response.mocRequired || 'N/A',
                  mocNumber: response.mocNumber || '',
                  mocStatus: response.mocStatus || 'N/A',
                  partsRequired: response.partsRequired || 'N/A',
                  partsExpectedDate: response.partsExpectedDate || '',
                  partsStatus: response.partsStatus || 'Not Assessed',
                  equipmentDisconnectionRequired: response.equipmentDisconnectionRequired || 'N/A',
                  equipmentRemovalRequired: response.equipmentRemovalRequired || 'N/A',
                  plannedResolutionDate: response.plannedResolutionDate || '',
                  actionRequired: response.actionRequired || 'N/A',
                  actionItems: response.actionItems || [],
                  comments: response.comments || '',
                  corrosionRisk: response.corrosionRisk || 'N/A',
                  deadLegsRisk: response.deadLegsRisk || 'N/A',
                  automationLossRisk: response.automationLossRisk || 'N/A'
                });
              }
            });
          }
        });
        
        if (allLTIs.length > 0) {
          dataSourceInfo = `React Context (${meetings.length} meetings, ${allLTIs.length} LTIs)`;
        }
      }
      
      // Strategy 2: Check localStorage savedMeetings if context is empty
      if (allLTIs.length === 0) {
        console.log('✅ Checking localStorage savedMeetings...');
        const savedMeetings = JSON.parse(localStorage.getItem('savedMeetings') || '[]');
        console.log(`📋 Found ${savedMeetings.length} saved meetings`);
        
        savedMeetings.forEach((meeting, index) => {
          if (meeting.isolations && meeting.responses) {
            meeting.isolations.forEach(isolation => {
              const response = meeting.responses[isolation.id] || {};
              const plannedStartDate = isolation['Planned Start Date'] || isolation.plannedStartDate;
              
              if (plannedStartDate) {
                const ageInfo = calculateLTIAge(plannedStartDate);
                allLTIs.push({
                  id: isolation.id,
                  description: isolation.description || isolation.Title || 'No description',
                  plannedStartDate: plannedStartDate,
                  ageInfo: ageInfo,
                  meetingDate: meeting.date,
                  source: 'localStorage',
                  riskLevel: response.riskLevel || 'N/A',
                  businessImpact: response.businessImpact || 'N/A',
                  mocRequired: response.mocRequired || 'N/A',
                  mocNumber: response.mocNumber || '',
                  mocStatus: response.mocStatus || 'N/A',
                  partsRequired: response.partsRequired || 'N/A',
                  partsExpectedDate: response.partsExpectedDate || '',
                  partsStatus: response.partsStatus || 'Not Assessed',
                  equipmentDisconnectionRequired: response.equipmentDisconnectionRequired || 'N/A',
                  equipmentRemovalRequired: response.equipmentRemovalRequired || 'N/A',
                  plannedResolutionDate: response.plannedResolutionDate || '',
                  actionRequired: response.actionRequired || 'N/A',
                  actionItems: response.actionItems || [],
                  comments: response.comments || '',
                  corrosionRisk: response.corrosionRisk || 'N/A',
                  deadLegsRisk: response.deadLegsRisk || 'N/A',
                  automationLossRisk: response.automationLossRisk || 'N/A'
                });
              }
            });
          }
        });
        
        if (allLTIs.length > 0) {
          dataSourceInfo = `localStorage (${savedMeetings.length} meetings, ${allLTIs.length} LTIs)`;
        }
      }
      
      // Strategy 3: Check current meeting in progress
      if (allLTIs.length === 0) {
        console.log('✅ Checking current meeting data...');
        const currentMeetingInfo = JSON.parse(localStorage.getItem('currentMeetingInfo') || 'null');
        const currentMeetingResponses = JSON.parse(localStorage.getItem('currentMeetingResponses') || '{}');
        
        if (currentMeetingInfo && currentMeetingInfo.isolations && Object.keys(currentMeetingResponses).length > 0) {
          currentMeetingInfo.isolations.forEach(isolation => {
            const response = currentMeetingResponses[isolation.id] || {};
            const plannedStartDate = isolation['Planned Start Date'] || isolation.plannedStartDate;
            
            if (plannedStartDate) {
              const ageInfo = calculateLTIAge(plannedStartDate);
              allLTIs.push({
                id: isolation.id,
                description: isolation.description || isolation.Title || 'No description',
                plannedStartDate: plannedStartDate,
                ageInfo: ageInfo,
                meetingDate: currentMeetingInfo.date || 'Current Meeting',
                source: 'Current Meeting',
                riskLevel: response.riskLevel || 'N/A',
                businessImpact: response.businessImpact || 'N/A',
                mocRequired: response.mocRequired || 'N/A',
                mocNumber: response.mocNumber || '',
                mocStatus: response.mocStatus || 'N/A',
                partsRequired: response.partsRequired || 'N/A',
                partsExpectedDate: response.partsExpectedDate || '',
                partsStatus: response.partsStatus || 'Not Assessed',
                equipmentDisconnectionRequired: response.equipmentDisconnectionRequired || 'N/A',
                equipmentRemovalRequired: response.equipmentRemovalRequired || 'N/A',
                plannedResolutionDate: response.plannedResolutionDate || '',
                actionRequired: response.actionRequired || 'N/A',
                actionItems: response.actionItems || [],
                comments: response.comments || '',
                corrosionRisk: response.corrosionRisk || 'N/A',
                deadLegsRisk: response.deadLegsRisk || 'N/A',
                automationLossRisk: response.automationLossRisk || 'N/A'
              });
            }
          });
          
          if (allLTIs.length > 0) {
            dataSourceInfo = `Current Meeting (${allLTIs.length} LTIs)`;
          }
        }
      }
      
      // Strategy 4: Create sample data for demonstration if no real data
      if (allLTIs.length === 0) {
        console.log('✅ No real data found, creating sample data for demonstration...');
        
        const today = new Date();
        const eightMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 8, today.getDate()).toISOString().split('T')[0];
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth() - 2, today.getDate()).toISOString().split('T')[0];
        const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toISOString().split('T')[0];
        const recentDate = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()).toISOString().split('T')[0];
        
        const sampleLTIs = [
          {
            id: 'CAHE-123-001',
            description: 'Main steam line isolation for valve replacement',
            plannedStartDate: eightMonthsAgo,
            ageInfo: calculateLTIAge(eightMonthsAgo),
            meetingDate: today.toISOString().split('T')[0],
            source: 'Sample Data',
            riskLevel: 'High',
            businessImpact: 'Medium',
            mocRequired: 'Yes',
            mocNumber: 'MOC-2024-001',
            mocStatus: 'In Progress',
            partsRequired: 'Yes',
            partsExpectedDate: '2024-12-01',
            partsStatus: 'Ordered',
            equipmentDisconnectionRequired: 'Yes',
            equipmentRemovalRequired: 'No',
            plannedResolutionDate: '2024-12-15',
            actionRequired: 'Plan Work',
            actionItems: [{ description: 'Schedule work window', owner: 'Maintenance Team' }],
            comments: 'HIGH PRIORITY: 8-month LTI requiring Asset Manager attention. Valve parts on order.',
            corrosionRisk: 'Medium',
            deadLegsRisk: 'Low',
            automationLossRisk: 'High'
          },
          {
            id: 'CAHE-123-002',
            description: 'Process line isolation for inspection access',
            plannedStartDate: twoYearsAgo,
            ageInfo: calculateLTIAge(twoYearsAgo),
            meetingDate: today.toISOString().split('T')[0],
            source: 'Sample Data',
            riskLevel: 'Critical',
            businessImpact: 'High',
            mocRequired: 'Yes',
            mocNumber: 'MOC-2024-002',
            mocStatus: 'Approved',
            partsRequired: 'No',
            partsExpectedDate: '',
            partsStatus: 'N/A',
            equipmentDisconnectionRequired: 'Partially',
            equipmentRemovalRequired: 'Temporarily',
            plannedResolutionDate: '2024-11-30',
            actionRequired: 'Urgent',
            actionItems: [{ description: 'URGENT: Asset Manager escalation required', owner: 'Operations Manager' }],
            comments: 'CRITICAL: 2+ year isolation requiring IMMEDIATE Asset Manager review and resolution.',
            corrosionRisk: 'High',
            deadLegsRisk: 'High',
            automationLossRisk: 'Medium'
          },
          {
            id: 'CAHE-123-003',
            description: 'Cooling water line isolation for pipe replacement',
            plannedStartDate: oneYearAgo,
            ageInfo: calculateLTIAge(oneYearAgo),
            meetingDate: today.toISOString().split('T')[0],
            source: 'Sample Data',
            riskLevel: 'Medium',
            businessImpact: 'Low',
            mocRequired: 'Yes',
            mocNumber: 'MOC-2024-003',
            mocStatus: 'Submitted',
            partsRequired: 'Yes',
            partsExpectedDate: '2024-10-15',
            partsStatus: 'In Transit',
            equipmentDisconnectionRequired: 'No',
            equipmentRemovalRequired: 'No',
            plannedResolutionDate: '2024-10-30',
            actionRequired: 'Monitor',
            actionItems: [],
            comments: '1-year LTI requiring Asset Manager review. Parts delayed but progress tracked.',
            corrosionRisk: 'Low',
            deadLegsRisk: 'Medium',
            automationLossRisk: 'Low'
          },
          {
            id: 'CAHE-123-004',
            description: 'Instrument air line isolation for valve maintenance',
            plannedStartDate: recentDate,
            ageInfo: calculateLTIAge(recentDate),
            meetingDate: today.toISOString().split('T')[0],
            source: 'Sample Data',
            riskLevel: 'Low',
            businessImpact: 'Low',
            mocRequired: 'No',
            mocNumber: '',
            mocStatus: 'N/A',
            partsRequired: 'No',
            partsExpectedDate: '',
            partsStatus: 'N/A',
            equipmentDisconnectionRequired: 'No',
            equipmentRemovalRequired: 'No',
            plannedResolutionDate: '2024-11-15',
            actionRequired: 'None',
            actionItems: [],
            comments: 'Recent isolation, low risk, scheduled for completion.',
            corrosionRisk: 'Low',
            deadLegsRisk: 'Low',
            automationLossRisk: 'Low'
          }
        ];
        
        allLTIs.push(...sampleLTIs);
        dataSourceInfo = `Sample data (${sampleLTIs.length} LTIs) - Demonstrates 6-month+ tracking with 3 LTIs requiring Asset Manager review`;
        console.log('✅ Sample data created:', sampleLTIs.length, 'LTIs');
      }
      
      // Strategy 2: If context has data, use it (real data trumps sample)
      if (meetings && meetings.length > 0) {
        // Clear sample data if we have real data
        allLTIs.length = 0;
        
        meetings.forEach((meeting, index) => {
          if (meeting.isolations && meeting.responses) {
            meeting.isolations.forEach(isolation => {
              const response = meeting.responses[isolation.id] || {};
              const plannedStartDate = isolation['Planned Start Date'] || isolation.plannedStartDate;
              
              if (plannedStartDate) {
                const ageInfo = calculateLTIAge(plannedStartDate);
                allLTIs.push({
                  id: isolation.id,
                  description: isolation.description || isolation.Title || 'No description',
                  plannedStartDate: plannedStartDate,
                  ageInfo: ageInfo,
                  meetingDate: meeting.date,
                  source: 'Real Data',
                  riskLevel: response.riskLevel || 'N/A',
                  businessImpact: response.businessImpact || 'N/A',
                  mocRequired: response.mocRequired || 'N/A',
                  mocNumber: response.mocNumber || '',
                  mocStatus: response.mocStatus || 'N/A',
                  partsRequired: response.partsRequired || 'N/A',
                  partsExpectedDate: response.partsExpectedDate || '',
                  partsStatus: response.partsStatus || 'Not Assessed',
                  equipmentDisconnectionRequired: response.equipmentDisconnectionRequired || 'N/A',
                  equipmentRemovalRequired: response.equipmentRemovalRequired || 'N/A',
                  plannedResolutionDate: response.plannedResolutionDate || '',
                  actionRequired: response.actionRequired || 'N/A',
                  actionItems: response.actionItems || [],
                  comments: response.comments || '',
                  corrosionRisk: response.corrosionRisk || 'N/A',
                  deadLegsRisk: response.deadLegsRisk || 'N/A',
                  automationLossRisk: response.automationLossRisk || 'N/A'
                });
              }
            });
          }
        });
        
        if (allLTIs.length > 0) {
          dataSourceInfo = `Real meeting data (${meetings.length} meetings, ${allLTIs.length} LTIs)`;
        }
      }
      
      // Strategy 3: Check localStorage if still no data
      if (allLTIs.length === 0) {
        console.log('✅ Checking localStorage savedMeetings...');
        const savedMeetings = JSON.parse(localStorage.getItem('savedMeetings') || '[]');
        
        savedMeetings.forEach((meeting, index) => {
          if (meeting.isolations && meeting.responses) {
            meeting.isolations.forEach(isolation => {
              const response = meeting.responses[isolation.id] || {};
              const plannedStartDate = isolation['Planned Start Date'] || isolation.plannedStartDate;
              
              if (plannedStartDate) {
                const ageInfo = calculateLTIAge(plannedStartDate);
                allLTIs.push({
                  id: isolation.id,
                  description: isolation.description || isolation.Title || 'No description',
                  plannedStartDate: plannedStartDate,
                  ageInfo: ageInfo,
                  meetingDate: meeting.date,
                  source: 'localStorage',
                  riskLevel: response.riskLevel || 'N/A',
                  businessImpact: response.businessImpact || 'N/A',
                  mocRequired: response.mocRequired || 'N/A',
                  mocNumber: response.mocNumber || '',
                  mocStatus: response.mocStatus || 'N/A',
                  partsRequired: response.partsRequired || 'N/A',
                  partsExpectedDate: response.partsExpectedDate || '',
                  partsStatus: response.partsStatus || 'Not Assessed',
                  equipmentDisconnectionRequired: response.equipmentDisconnectionRequired || 'N/A',
                  equipmentRemovalRequired: response.equipmentRemovalRequired || 'N/A',
                  plannedResolutionDate: response.plannedResolutionDate || '',
                  actionRequired: response.actionRequired || 'N/A',
                  actionItems: response.actionItems || [],
                  comments: response.comments || '',
                  corrosionRisk: response.corrosionRisk || 'N/A',
                  deadLegsRisk: response.deadLegsRisk || 'N/A',
                  automationLossRisk: response.automationLossRisk || 'N/A'
                });
              }
            });
          }
        });
        
        if (allLTIs.length > 0) {
          dataSourceInfo = `localStorage (${savedMeetings.length} meetings, ${allLTIs.length} LTIs)`;
        }
      }
      
      console.log(`🎯 Final result: ${allLTIs.length} LTIs processed from ${dataSourceInfo}`);
      
    } catch (error) {
      console.error('❌ Error processing LTI data:', error);
      dataSourceInfo = `Error: ${error.message}`;
    }
    
    return allLTIs;
  }, [meetings]);

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalLTIs = processedLTIData.length;
    const sixMonthsPlus = processedLTIData.filter(lti => lti.ageInfo.isSixMonthsPlus);
    const criticalRisk = processedLTIData.filter(lti => lti.riskLevel === 'Critical');
    const highRisk = processedLTIData.filter(lti => lti.riskLevel === 'High');
    const mocRequired = processedLTIData.filter(lti => lti.mocRequired === 'Yes');
    const mocInProgress = processedLTIData.filter(lti => 
      lti.mocRequired === 'Yes' && 
      (lti.mocStatus === 'Submitted' || lti.mocStatus === 'Approved' || lti.mocStatus === 'In Progress')
    );
    const equipmentIssues = processedLTIData.filter(lti => 
      lti.equipmentDisconnectionRequired === 'Yes' || lti.equipmentRemovalRequired === 'Yes'
    );
    const urgentAction = processedLTIData.filter(lti => lti.actionRequired === 'Urgent');
    
    return {
      totalLTIs,
      sixMonthsPlus: sixMonthsPlus.length,
      criticalRisk: criticalRisk.length,
      highRisk: highRisk.length,
      mocRequired: mocRequired.length,
      mocInProgress: mocInProgress.length,
      equipmentIssues: equipmentIssues.length,
      urgentAction: urgentAction.length,
      sixMonthsPlusLTIs: sixMonthsPlus,
      criticalLTIs: criticalRisk,
      urgentLTIs: urgentAction
    };
  }, [processedLTIData]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const handleViewDetails = (lti) => {
    setSelectedLTI(lti);
    setDetailDialogOpen(true);
  };

  const generateMeetingAgenda = () => {
    setAgendaDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
          Asset Manager Dashboard
        </Typography>
        
         <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>WMS Manual Requirement:</strong> LTIs over 6 months require Asset Manager review every 6 months. 
          This dashboard tracks {dashboardStats.sixMonthsPlus} LTIs requiring management attention.
        </Alert>

        {/* Data Source Debug Information */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Data Source Status:</Typography>
          <Typography variant="body2">
            <strong>Meetings from Context:</strong> {meetings.length} meetings
            <br />
            <strong>Processed LTIs:</strong> {processedLTIData.length} total
            <br />
            <strong>6+ Month LTIs:</strong> {dashboardStats.sixMonthsPlus} requiring review
            <br />
            <strong>Critical/High Risk:</strong> {dashboardStats.criticalRisk + dashboardStats.highRisk} LTIs
          </Typography>
          
          {processedLTIData.length === 0 && (
            <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
              <strong>⚠️ No LTI data available.</strong> To populate this dashboard:
              <br />• Create a meeting and upload Excel file with LTI data
              <br />• Fill out questionnaires for existing LTIs
              <br />• The dashboard will show sample data if no real data exists
            </Typography>
          )}
          
          {processedLTIData.length > 0 && processedLTIData[0].source === 'Sample Data' && (
            <Typography variant="body2" sx={{ mt: 1, color: 'info.main' }}>
              <strong>📊 Showing sample data</strong> to demonstrate Asset Manager Dashboard functionality.
              <br />Sample includes 3 LTIs over 6 months requiring Asset Manager review.
            </Typography>
          )}
        </Alert>
      </Box>

      {/* Key Metrics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <DashboardIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h3" color="primary.main">{dashboardStats.totalLTIs}</Typography>
              <Typography variant="body2" color="text.secondary">Total LTIs</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h3" color="warning.main">{dashboardStats.sixMonthsPlus}</Typography>
              <Typography variant="body2" color="text.secondary">6+ Months Old</Typography>
              <Chip label="REQUIRES REVIEW" size="small" color="warning" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h3" color="error.main">{dashboardStats.criticalRisk}</Typography>
              <Typography variant="body2" color="text.secondary">Critical Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h3" color="success.main">{dashboardStats.mocRequired}</Typography>
              <Typography variant="body2" color="text.secondary">MOCs Required</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<CalendarIcon />}
          onClick={generateMeetingAgenda}
          color="primary"
          size="large"
        >
          Generate Meeting Agenda
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          color="secondary"
          size="large"
        >
          Export Asset Manager Report
        </Button>
      </Box>

      {/* 6+ Month LTIs Requiring Review */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            LTIs Over 6 Months - Requiring Asset Manager Review ({dashboardStats.sixMonthsPlus})
          </Typography>
          
          {dashboardStats.sixMonthsPlus > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>LTI ID</strong></TableCell>
                    <TableCell><strong>Age</strong></TableCell>
                    <TableCell><strong>Risk</strong></TableCell>
                    <TableCell><strong>MOC Status</strong></TableCell>
                    <TableCell><strong>Parts Status</strong></TableCell>
                    <TableCell><strong>Equipment Issues</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardStats.sixMonthsPlusLTIs.map((lti) => (
                    <TableRow key={lti.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {lti.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={lti.ageInfo.display} 
                          size="small" 
                          color={lti.ageInfo.days > 730 ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={lti.riskLevel} 
                          size="small" 
                          color={getRiskColor(lti.riskLevel)}
                        />
                      </TableCell>
                      <TableCell>
                        {lti.mocRequired === 'Yes' ? (
                          <Box>
                            <Typography variant="body2">Required</Typography>
                            <Typography variant="caption">{lti.mocStatus}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2">{lti.mocRequired}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {lti.partsRequired === 'Yes' ? (
                          <Box>
                            <Typography variant="body2">{lti.partsStatus}</Typography>
                            {lti.partsExpectedDate && (
                              <Typography variant="caption" color="text.secondary">
                                Expected: {new Date(lti.partsExpectedDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2">{lti.partsRequired}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {lti.equipmentDisconnectionRequired === 'Yes' && (
                          <Chip label="Disconnect" size="small" color="warning" sx={{ mr: 0.5 }} />
                        )}
                        {lti.equipmentRemovalRequired === 'Yes' && (
                          <Chip label="Remove" size="small" color="error" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Full Details">
                          <IconButton size="small" onClick={() => handleViewDetails(lti)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">
              <strong>Good News:</strong> No LTIs are currently over 6 months old requiring Asset Manager review.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* MOC Progress Tracking */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                MOC Progress Tracking
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary={`MOCs Required: ${dashboardStats.mocRequired}`}
                    secondary="Total LTIs requiring Management of Change"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={`MOCs In Progress: ${dashboardStats.mocInProgress}`}
                    secondary="Currently being processed"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="MOC Progress Rate"
                    secondary={`${dashboardStats.mocRequired > 0 ? Math.round((dashboardStats.mocInProgress / dashboardStats.mocRequired) * 100) : 0}% completion rate`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <BuildIcon sx={{ mr: 1, color: 'warning.main' }} />
                Equipment Management Issues
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary={`Equipment Issues: ${dashboardStats.equipmentIssues}`}
                    secondary="LTIs requiring equipment disconnection or removal"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={`Urgent Actions: ${dashboardStats.urgentAction}`}
                    secondary="LTIs requiring immediate action"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Risk Distribution"
                    secondary={`Critical: ${dashboardStats.criticalRisk} | High: ${dashboardStats.highRisk} LTIs`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LTI Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          LTI Details: {selectedLTI?.id}
        </DialogTitle>
        <DialogContent>
          {selectedLTI && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Typography variant="body2">Description: {selectedLTI.description}</Typography>
              <Typography variant="body2">Age: {selectedLTI.ageInfo.display}</Typography>
              <Typography variant="body2">Risk Level: {selectedLTI.riskLevel}</Typography>
              <Typography variant="body2">Business Impact: {selectedLTI.businessImpact}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>MOC Information</Typography>
              <Typography variant="body2">MOC Required: {selectedLTI.mocRequired}</Typography>
              {selectedLTI.mocRequired === 'Yes' && (
                <>
                  <Typography variant="body2">MOC Number: {selectedLTI.mocNumber || 'Not assigned'}</Typography>
                  <Typography variant="body2">MOC Status: {selectedLTI.mocStatus}</Typography>
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Parts & Equipment</Typography>
              <Typography variant="body2">Parts Required: {selectedLTI.partsRequired}</Typography>
              {selectedLTI.partsRequired === 'Yes' && (
                <>
                  <Typography variant="body2">Parts Status: {selectedLTI.partsStatus}</Typography>
                  <Typography variant="body2">Expected Arrival: {selectedLTI.partsExpectedDate || 'Not specified'}</Typography>
                </>
              )}
              <Typography variant="body2">Equipment Disconnection: {selectedLTI.equipmentDisconnectionRequired}</Typography>
              <Typography variant="body2">Equipment Removal: {selectedLTI.equipmentRemovalRequired}</Typography>
              
              {selectedLTI.comments && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Comments</Typography>
                  <Typography variant="body2">{selectedLTI.comments}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Agenda Dialog */}
      <Dialog 
        open={agendaDialogOpen} 
        onClose={() => setAgendaDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Asset Manager Review Meeting Agenda
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Asset Manager Review Meeting
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Duration:</strong> 90 minutes
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Purpose:</strong> 6-Month LTI Review (WMS Manual Compliance)
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Meeting Agenda</Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              1. Executive Summary (10 min)
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={`Total LTIs: ${dashboardStats.totalLTIs}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`LTIs Over 6 Months: ${dashboardStats.sixMonthsPlus} (Require Review)`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Critical Risk: ${dashboardStats.criticalRisk} | High Risk: ${dashboardStats.highRisk}`} />
              </ListItem>
            </List>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              2. Critical LTIs Review (30 min)
            </Typography>
            {dashboardStats.sixMonthsPlusLTIs.length > 0 ? (
              <List dense>
                {dashboardStats.sixMonthsPlusLTIs.slice(0, 5).map((lti) => (
                  <ListItem key={lti.id}>
                    <ListItemText 
                      primary={`${lti.id}: ${lti.ageInfo.display} old, ${lti.riskLevel} risk`}
                      secondary={`MOC: ${lti.mocRequired} | Equipment Issues: ${lti.equipmentDisconnectionRequired === 'Yes' ? 'Disconnect' : ''} ${lti.equipmentRemovalRequired === 'Yes' ? 'Remove' : ''}`}
                    />
                  </ListItem>
                ))}
                {dashboardStats.sixMonthsPlusLTIs.length > 5 && (
                  <ListItem>
                    <ListItemText primary={`... and ${dashboardStats.sixMonthsPlusLTIs.length - 5} more LTIs`} />
                  </ListItem>
                )}
              </List>
            ) : (
              <Typography variant="body2">No LTIs over 6 months requiring review.</Typography>
            )}
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              3. MOC Status Review (20 min)
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={`MOCs Required: ${dashboardStats.mocRequired}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`MOCs In Progress: ${dashboardStats.mocInProgress}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Discussion: Barriers to completion, resource allocation" />
              </ListItem>
            </List>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              4. Equipment Management (15 min)
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={`Equipment Issues: ${dashboardStats.equipmentIssues} LTIs requiring disconnection/removal`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Discussion: Resource requirements, safety considerations, work windows" />
              </ListItem>
            </List>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              5. Action Items (10 min)
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={`Urgent Actions: ${dashboardStats.urgentAction} LTIs`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Assign owners and timelines for critical LTIs" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Schedule next Asset Manager review (6 months)" />
              </ListItem>
            </List>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgendaDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Agenda PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetManagerDashboard;