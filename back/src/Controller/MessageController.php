<?php

namespace App\Controller;

use App\Entity\Message;
use App\Service\MessageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MessageController extends AbstractController
{
    private $messageService;
    private $em;
    public function __construct(MessageService $messageService, EntityManagerInterface $em) {
        $this->messageService = $messageService;
        $this->em = $em;
    }
    

    #[Route('/message', name: 'get_message', methods: ['GET'])]
    public function getMessage() : Response {
        $messages = $this->em->getRepository(Message::class)->findAll();

        return $this->render('message/index.html.twig', [
            'messages' => $messages,
        ]);
        return $this->render('message/index.html.twig');
    }

    #[Route('/message', name: 'send_message', methods: ['POST'])]
    public function sendMessage(Request $request) {
        $content = $request->get('content');
        $author = $this->getUser();
        if ($author) {
            $author = $author->getUserIdentifier();
        }
        else {
            throw new \Exception("No User is authenticated ! ");
        }
        $this->messageService->sendMessage($content, $author);
        return $this->redirect('message');
    }
}
