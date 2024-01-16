package tech.centrico.classificazione;

import org.springframework.web.bind.annotation.*;
import java.util.Collection;
import javax.naming.NamingException;
import java.rmi.RemoteException;
import javax.ejb.CreateException;
import javax.ejb.RemoveException;
import javax.ejb.FinderException;

@RestController
@RequestMapping("/api")
public class ClassificazioneAggregationController {

    private final ClassificazioneAggregationFactory classificazioneAggregationFactory;

    public ClassificazioneAggregationController(ClassificazioneAggregationFactory classificazioneAggregationFactory) {
        this.classificazioneAggregationFactory = classificazioneAggregationFactory;
    }

    @PostMapping("/addItem")
    public void addItem(Long owner, String topic, Long item) throws CreateException, NamingException, RemoteException {
        classificazioneAggregationFactory.addItem(owner, topic, item);
    }

    @DeleteMapping("/removeItem")
    public void removeItem(Long owner, String topic, Long item) throws RemoveException, NamingException, RemoteException, FinderException {
        classificazioneAggregationFactory.removeItem(owner, topic, item);
    }

    @PostMapping("/addAll")
    public void addAll(Long owner, String topic, Long[] items) throws CreateException, NamingException, RemoteException {
        classificazioneAggregationFactory.addAll(owner, topic, items);
    }

    @DeleteMapping("/removeAll")
    public void removeAll(Long owner, String topic, Long[] items) throws RemoveException, NamingException, RemoteException, FinderException {
        classificazioneAggregationFactory.removeAll(owner, topic, items);
    }

    @DeleteMapping("/removeAllTopic")
    public void removeAll(Long owner, String topic) throws RemoveException, NamingException, RemoteException, FinderException {
        classificazioneAggregationFactory.removeAll(owner, topic);
    }

    @PutMapping("/setAll")
    public void setAll(Long owner, String topic, Long[] items) throws CreateException, RemoveException, NamingException, RemoteException, FinderException {
        classificazioneAggregationFactory.setAll(owner, topic, items);
    }

    @GetMapping("/listItems")
    public Collection<ClassificazioneView> listItems(Long owner, String topic) throws FinderException, NamingException, RemoteException, CreateException {
        return classificazioneAggregationFactory.listItems(owner, topic);
    }

    @GetMapping("/listTopics")
    public Collection<String> listTopics() throws FinderException, NamingException, RemoteException, CreateException {
        return classificazioneAggregationFactory.listTopics();
    }

    @GetMapping("/listOwners")
    public Collection<ClassificazioneView> listOwners(String topic) throws FinderException, NamingException, RemoteException, CreateException {
        return classificazioneAggregationFactory.listOwners(topic);
    }
}